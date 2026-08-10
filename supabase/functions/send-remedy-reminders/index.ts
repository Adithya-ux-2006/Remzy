// supabase/functions/send-remedy-reminders/index.ts
// Triggered by cron (every 5 minutes) — via Netlify Scheduled Function or external cron.
// Queries remedy_schedules for due reminders and sends emails.
//
// Required env vars (set in Supabase Dashboard > Edge Functions > Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   APP_URL (your deployed app URL, e.g. https://remzyy.netlify.app)
//   EMAIL_API_KEY (Resend/SendGrid/Postmark — pick one)
//   EMAIL_FROM (verified sender address)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current time (UTC) with a 5-minute window
    const now = new Date();
    const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const windowStart = currentMinutes;
    const windowEnd = currentMinutes + 5;

    // Query active schedules due in this window
    // scheduled_time is stored as TIME — compare as minutes-from-midnight
    const { data: schedules, error: fetchError } = await supabase
      .from("remedy_schedules")
      .select("*")
      .eq("active", true);

    if (fetchError) throw fetchError;

    // Filter schedules that fall within the current 5-minute window
    const dueSchedules = (schedules || []).filter((s: any) => {
      const [h, m] = s.scheduled_time.split(":").map(Number);
      const scheduleMinutes = h * 60 + m;

      if (s.recurrence === "once") {
        return scheduleMinutes >= windowStart && scheduleMinutes < windowEnd;
      }

      if (s.recurrence === "daily") {
        return scheduleMinutes >= windowStart && scheduleMinutes < windowEnd;
      }

      if (s.recurrence === "weekly") {
        const dayOfWeek = now.getUTCDay();
        const isCorrectDay = s.days_of_week?.includes(dayOfWeek) ?? false;
        return isCorrectDay && scheduleMinutes >= windowStart && scheduleMinutes < windowEnd;
      }

      return false;
    });

    if (dueSchedules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders due", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Fetch user emails
    const userIds = [...new Set(dueSchedules.map((s: any) => s.user_id))];
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, name")
      .in("id", userIds);

    if (usersError) throw usersError;

    const userMap = new Map((users || []).map((u: any) => [u.id, u]));

    // Send emails (placeholder — replace with your email provider)
    const appUrl = Deno.env.get("APP_URL") || "https://remzyy.netlify.app";
    let sent = 0;
    for (const schedule of dueSchedules) {
      const user = userMap.get(schedule.user_id);
      if (!user?.email) continue;

      // Try to get AI-generated copy, fall back to static
      let reminderText = `Time to take your ${schedule.remedy_name}!`;
      try {
        const copyResponse = await fetch(`${appUrl}/api/ai-reminder-copy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remedyName: schedule.remedy_name, symptomId: schedule.remedy_id }),
        });
        if (copyResponse.ok) {
          const copyData = await copyResponse.json();
          if (copyData.copy) reminderText = copyData.copy;
        }
      } catch {
        // Use default reminder text
      }

      // TODO: Replace with actual email provider call (Resend/SendGrid/Postmark)
      // Example with Resend:
      // await fetch("https://api.resend.com/emails", {
      //   method: "POST",
      //   headers: { "Authorization": `Bearer ${Deno.env.get("EMAIL_API_KEY")}`, "Content-Type": "application/json" },
      //   body: JSON.stringify({ from: Deno.env.get("EMAIL_FROM"), to: user.email, subject: "Remedy Reminder", text: reminderText }),
      // });

      console.log(`[DRY RUN] Would send to ${user.email}: ${reminderText}`);
      sent++;

      // If one-time schedule, deactivate after sending
      if (schedule.recurrence === "once") {
        await supabase
          .from("remedy_schedules")
          .update({ active: false })
          .eq("id", schedule.id);
      }
    }

    return new Response(
      JSON.stringify({ message: "Reminders processed", count: sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error sending reminders:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
