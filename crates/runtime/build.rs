use std::{env, fs, path::Path};
fn walk(root: &Path, dir: &Path, out: &mut String) {
    let mut entries: Vec<_> = fs::read_dir(dir)
        .expect("frontend assets readable")
        .map(|e| e.unwrap().path())
        .collect();
    entries.sort();
    for path in entries {
        if fs::symlink_metadata(&path)
            .unwrap()
            .file_type()
            .is_symlink()
        {
            panic!("frontend asset symlinks are not supported");
        }
        if path.is_dir() {
            walk(root, &path, out);
        } else {
            let route = format!(
                "/{}",
                path.strip_prefix(root)
                    .unwrap()
                    .to_str()
                    .unwrap()
                    .replace('\\', "/")
            );
            out.push_str(&format!(
                "({route:?},include_bytes!({:?}).as_slice()),\n",
                path.canonicalize().unwrap().to_str().unwrap()
            ));
        }
    }
}
fn main() {
    let root = Path::new("../../frontend/dist");
    println!("cargo:rerun-if-changed=../../frontend/dist");
    if !root.join("index.html").is_file() {
        panic!(
            "Build frontend assets first: npm --prefix frontend ci --ignore-scripts && npm --prefix frontend run build"
        );
    }
    let mut out = String::from("const ASSETS: &[(&str, &[u8])] = &[\n");
    walk(root, root, &mut out);
    out.push_str("];\n");
    fs::write(
        Path::new(&env::var("OUT_DIR").unwrap()).join("assets.rs"),
        out,
    )
    .unwrap();
}
