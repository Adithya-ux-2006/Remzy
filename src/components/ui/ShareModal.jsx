import { useState, useEffect } from 'react';
import { Share2, Trash2, Clock, CheckCircle, Send } from 'lucide-react';
import { Modal } from './Modal';
import { useProfileSharesStore } from '../../store/profileSharesStore';

export function ShareModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const shares = useProfileSharesStore((s) => s.shares);
  const isLoading = useProfileSharesStore((s) => s.isLoading);
  const fetchShares = useProfileSharesStore((s) => s.fetchShares);
  const inviteViewer = useProfileSharesStore((s) => s.inviteViewer);
  const revokeAccess = useProfileSharesStore((s) => s.revokeAccess);

  useEffect(() => {
    if (isOpen) fetchShares();
  }, [isOpen, fetchShares]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await inviteViewer(email);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setEmail('');
    }
  };

  const handleRevoke = async (shareId) => {
    await revokeAccess(shareId);
  };

  const activeShares = shares.filter((s) => s.status === 'active');
  const pendingShares = shares.filter((s) => s.status === 'pending');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Health Profile">
      <div className="space-y-6">
        {/* Invite form */}
        <form onSubmit={handleInvite} className="space-y-3">
          <p className="text-sm text-ink-muted">
            Invite someone to view your Health Profile, Saved Remedies, and Treatment Reminders. They must have a Remzy account to accept.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="viewer@example.com"
              required
              className="flex-1 bg-surface rounded-xl border border-border px-3 py-2 text-sm text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Sending...' : 'Invite'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>

        {/* Pending invites */}
        {pendingShares.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Pending Invites
            </h3>
            <div className="space-y-2">
              {pendingShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-sm text-ink truncate">{share.viewer_email}</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    aria-label="Revoke invite"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active shares */}
        {activeShares.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Active Viewers
            </h3>
            <div className="space-y-2">
              {activeShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-ink truncate">{share.viewer_email}</span>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                    aria-label="Revoke access"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && shares.length === 0 && (
          <div className="text-center py-4">
            <Share2 className="w-8 h-8 text-ink-muted/40 mx-auto mb-2" />
            <p className="text-sm text-ink-muted">No shares yet. Invite someone above to get started.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
