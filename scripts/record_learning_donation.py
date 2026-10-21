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
    if not args.amount_usd.is_finite() or args.amount_usd != args.amount_usd.to_integral_value():
        parser.error('Use a positive whole USD amount matching USD 1 pledge allocations.')
    payout_id = learning_impact.record_transfer(int(args.amount_usd)*100, args.recipient, args.receipt_url, args.paid_at)
    print(f'Recorded completed transfer receipt #{payout_id}. This command did not transfer money.')
