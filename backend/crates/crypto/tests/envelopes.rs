use hypergraph_crypto::{Context, Error, MAX_PLAINTEXT, Purpose, SecretKey, storage_address};

fn context() -> Context {
    Context {
        workspace: [0x51; 16],
        binding: [0x29; 32],
        purpose: Purpose::Revision,
        epoch: 7,
    }
}

#[test]
fn encryption_hides_equal_content_and_binds_every_context_field() {
    let key = SecretKey::generate().unwrap();
    let expected = context();
    let plaintext = b"A private revision with retained provenance.";
    let a = key.seal(expected, plaintext).unwrap();
    let b = key.seal(expected, plaintext).unwrap();
    assert_eq!(&key.open(expected, &a).unwrap()[..], plaintext);
    assert_eq!(&key.open(expected, &b).unwrap()[..], plaintext);
    assert_ne!(a, b);
    assert_ne!(storage_address(&a), storage_address(&b));
    assert_eq!(a.len(), plaintext.len() + 46);
    assert!(!a.windows(plaintext.len()).any(|bytes| bytes == plaintext));
    for changed in [
        Context {
            workspace: [0x52; 16],
            ..expected
        },
        Context {
            binding: [0x30; 32],
            ..expected
        },
        Context {
            purpose: Purpose::Draft,
            ..expected
        },
        Context {
            epoch: 8,
            ..expected
        },
    ] {
        assert_eq!(key.open(changed, &a), Err(Error::Authentication));
    }
    assert_eq!(
        SecretKey::generate().unwrap().open(expected, &a),
        Err(Error::Authentication)
    );
    // Parsing/authentication must reject corruption in every byte, including the header.
    for position in 0..a.len() {
        let mut corrupt = a.clone();
        corrupt[position] ^= 1;
        assert!(
            key.open(expected, &corrupt).is_err(),
            "accepted byte {position}"
        );
    }
    for length in 0..a.len() {
        assert!(key.open(expected, &a[..length]).is_err());
    }
    let mut extended = a;
    extended.push(0);
    assert_eq!(key.open(expected, &extended), Err(Error::Authentication));
}

#[test]
fn explicit_resource_limits_and_empty_payload() {
    let key = SecretKey::generate().unwrap();
    let expected = context();
    let empty = key.seal(expected, b"").unwrap();
    assert!(key.open(expected, &empty).unwrap().is_empty());
    let oversized = vec![0; MAX_PLAINTEXT + 1];
    assert_eq!(key.seal(expected, &oversized), Err(Error::Resource));
    let oversized_envelope = vec![0; MAX_PLAINTEXT + 47];
    assert_eq!(
        key.open(expected, &oversized_envelope),
        Err(Error::Resource)
    );
    // Every short input is rejected without panic, regardless of prefix contents.
    for length in 0..46 {
        assert_eq!(
            key.open(expected, &vec![0xff; length]),
            Err(Error::Malformed)
        );
    }
    assert_eq!(
        key.wrap(b"", expected.workspace, expected.epoch),
        Err(Error::Passphrase)
    );
    assert_eq!(
        key.wrap(&[1; 1025], expected.workspace, expected.epoch),
        Err(Error::Passphrase)
    );
    assert!(matches!(
        SecretKey::unlock(b"", expected.workspace, expected.epoch, b""),
        Err(Error::Passphrase)
    ));
}

#[test]
fn passphrase_rewrap_keeps_existing_objects_and_rejects_substitution() {
    // Deliberately synthetic fixtures, unrelated to any user's credentials.
    let key = SecretKey::generate().unwrap();
    let expected = context();
    let sealed = key
        .seal(expected, b"A revision created before passphrase change.")
        .unwrap();
    let first = key
        .wrap(
            b"synthetic old storage phrase",
            expected.workspace,
            expected.epoch,
        )
        .unwrap();
    assert_eq!(first.len(), 106);
    let unlocked = SecretKey::unlock(
        b"synthetic old storage phrase",
        expected.workspace,
        expected.epoch,
        &first,
    )
    .unwrap();
    let second = unlocked
        .wrap(
            b"synthetic replacement phrase",
            expected.workspace,
            expected.epoch,
        )
        .unwrap();
    drop(key);
    drop(unlocked);
    let reopened = SecretKey::unlock(
        b"synthetic replacement phrase",
        expected.workspace,
        expected.epoch,
        &second,
    )
    .unwrap();
    assert_eq!(
        &reopened.open(expected, &sealed).unwrap()[..],
        b"A revision created before passphrase change."
    );
    assert_ne!(first, second);
    assert!(matches!(
        SecretKey::unlock(
            b"synthetic old storage phrase",
            expected.workspace,
            expected.epoch,
            &second
        ),
        Err(Error::Authentication)
    ));
    assert!(matches!(
        SecretKey::unlock(
            b"synthetic replacement phrase",
            [0x52; 16],
            expected.epoch,
            &second
        ),
        Err(Error::Authentication)
    ));
    assert!(matches!(
        SecretKey::unlock(
            b"synthetic replacement phrase",
            expected.workspace,
            8,
            &second
        ),
        Err(Error::Authentication)
    ));
    let mut corrupt = second.clone();
    corrupt[105] ^= 1;
    assert!(matches!(
        SecretKey::unlock(
            b"synthetic replacement phrase",
            expected.workspace,
            expected.epoch,
            &corrupt
        ),
        Err(Error::Authentication)
    ));
    for position in [18, 34] {
        let mut corrupt = second.clone();
        corrupt[position] ^= 1;
        assert!(matches!(
            SecretKey::unlock(
                b"synthetic replacement phrase",
                expected.workspace,
                expected.epoch,
                &corrupt
            ),
            Err(Error::Authentication)
        ));
    }
    // Valid old encrypted envelopes cannot be revoked by simply replacing the wrapper.
    let old = SecretKey::unlock(
        b"synthetic old storage phrase",
        expected.workspace,
        expected.epoch,
        &first,
    )
    .unwrap();
    assert_eq!(
        &old.open(expected, &sealed).unwrap()[..],
        b"A revision created before passphrase change."
    );
    // Unknown profiles/suites are rejected before any attacker-selected KDF execution.
    for position in 0..18 {
        let mut unsupported = second.clone();
        unsupported[position] ^= 1;
        assert!(matches!(
            SecretKey::unlock(
                b"synthetic replacement phrase",
                expected.workspace,
                expected.epoch,
                &unsupported
            ),
            Err(Error::Unsupported)
        ));
    }
    for length in 0..second.len() {
        assert!(matches!(
            SecretKey::unlock(
                b"synthetic replacement phrase",
                expected.workspace,
                expected.epoch,
                &second[..length]
            ),
            Err(Error::Malformed)
        ));
    }
    let mut extended = second;
    extended.push(0);
    assert!(matches!(
        SecretKey::unlock(
            b"synthetic replacement phrase",
            expected.workspace,
            expected.epoch,
            &extended
        ),
        Err(Error::Malformed)
    ));
}
