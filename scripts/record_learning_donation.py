"""Record an already-completed company donation receipt; does not send money."""
import argparse
from decimal import Decimal
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'src'))
import learning_impact

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--amount-usd', type=Decimal, required=True)
    parser.add_argument('--recipient', required=True)
    parser.add_argument('--receipt-url', required=True, help='Public receipt with private details redacted')
    parser.add_argument('--paid-at', required=True, help='Actual transfer date YYYY-MM-DD')
    args = parser.parse_args()
    amount_cents = args.amount_usd * 100
    if (not args.amount_usd.is_finite() or amount_cents != amount_cents.to_integral_value() or
            int(amount_cents) <= 0 or int(amount_cents) % learning_impact.PLEDGE_PER_BADGE_CENTS):
        parser.error('Use a positive USD amount in multiples of USD 0.10.')
    payout_id = learning_impact.record_transfer(int(amount_cents), args.recipient, args.receipt_url, args.paid_at)
    print(f'Recorded completed transfer receipt #{payout_id}. This command did not transfer money.')
