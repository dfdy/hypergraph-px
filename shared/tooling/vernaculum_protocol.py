"""Read the exact installed Vernaculum specification; no negotiation or adoption side effects."""
from pathlib import Path
import argparse
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[2]
PROTOCOL = ROOT / "shared/tooling/protocol/PROTOCOL.md"
SHA256 = "a36b882c56c2355c42945fe8be93eab416cfcd8ead084fb9c066514a05717632"


def read_protocol(path: Path = PROTOCOL) -> bytes:
    data = path.read_bytes()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError("Installed Vernaculum protocol SHA256 differs from the approved pin")
    return data


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check exact bytes without printing the full protocol")
    args = parser.parse_args()
    try:
        data = read_protocol()
    except (OSError, ValueError) as error:
        parser.exit(1, str(error) + "\n")
    if args.check:
        print("PASS: installed Vernaculum SCP:MS 2.0.0 SHA256 " + SHA256)
    else:
        sys.stdout.buffer.write(data)


if __name__ == "__main__":
    main()
