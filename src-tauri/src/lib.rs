// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::fs;
use std::path::Path;

#[derive(serde::Serialize, serde::Deserialize, Clone)]
struct NotebookItem {
    name: String,
    path: String,
    is_dir: bool,
    children: Option<Vec<NotebookItem>>,
}

fn scan_directory(dir: &Path) -> Result<Vec<NotebookItem>, std::io::Error> {
    let mut items = Vec::new();
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();

            // Ignore the assets folder "files" and standard dotfiles
            if name == "files" || name.starts_with('.') {
                continue;
            }

            let is_dir = path.is_dir();
            let children = if is_dir {
                Some(scan_directory(&path)?)
            } else {
                // Only include JSON files as canvases
                if !name.ends_with(".json") {
                    continue;
                }
                None
            };

            items.push(NotebookItem {
                name,
                path: path.to_string_lossy().to_string(),
                is_dir,
                children,
            });
        }
    }
    // Sort: directories first, then files alphabetically
    items.sort_by(|a, b| {
        if a.is_dir != b.is_dir {
            b.is_dir.cmp(&a.is_dir)
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });
    Ok(items)
}

#[tauri::command]
fn get_notebook_tree(notebook_path: String) -> Result<Vec<NotebookItem>, String> {
    let path = Path::new(&notebook_path);
    scan_directory(path).map_err(|e| format!("Błąd skanowania katalogu: {}", e))
}

#[tauri::command]
fn create_notebook_dir(parent_path: String, name: String) -> Result<(), String> {
    let path = Path::new(&parent_path).join(&name);
    fs::create_dir(path).map_err(|e| format!("Błąd podczas tworzenia katalogu: {}", e))
}

#[tauri::command]
fn create_canvas_file(parent_path: String, name: String) -> Result<(), String> {
    let mut file_name = name;
    if !file_name.ends_with(".json") {
        file_name.push_str(".json");
    }
    let path = Path::new(&parent_path).join(file_name);
    
    // Write a blank canvas template
    let empty_state = serde_json::json!({
        "blocks": [],
        "links": []
    });
    fs::write(path, serde_json::to_string_pretty(&empty_state).unwrap())
        .map_err(|e| format!("Błąd podczas tworzenia pliku planszy: {}", e))
}

#[tauri::command]
fn rename_notebook_item(old_path: String, new_path: String) -> Result<(), String> {
    let src = Path::new(&old_path);
    let dest = Path::new(&new_path);
    fs::rename(src, dest).map_err(|e| format!("Błąd podczas zmiany nazwy: {}", e))
}

#[tauri::command]
fn delete_notebook_item(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| format!("Błąd podczas usuwania katalogu: {}", e))
    } else {
        fs::remove_file(p).map_err(|e| format!("Błąd podczas usuwania pliku: {}", e))
    }
}

#[tauri::command]
fn move_notebook_item(src_path: String, dest_parent_path: String) -> Result<(), String> {
    let src = Path::new(&src_path);
    let file_name = src.file_name()
        .ok_or_else(|| "Błędna nazwa pliku źródłowego".to_string())?;
    
    let dest = Path::new(&dest_parent_path).join(file_name);
    fs::rename(src, dest).map_err(|e| format!("Błąd podczas przenoszenia elementu: {}", e))
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn update_block_position(id: String, x: i32, y: i32) {
    println!("Block {} position updated to x: {}, y: {}", id, x, y);
}

#[tauri::command]
fn delete_block(id: String) {
    println!("Block {} deleted", id);
}

#[tauri::command]
fn select_notebook() -> Option<String> {
    let folder = rfd::FileDialog::new()
        .set_title("Wybierz katalog notatnika")
        .pick_folder();
    folder.map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
fn select_plugin_file() -> Option<String> {
    let file = rfd::FileDialog::new()
        .set_title("Wybierz plik wtyczki (.js)")
        .add_filter("JavaScript", &["js"])
        .pick_file();
    file.map(|p| p.to_string_lossy().to_string())
}

#[tauri::command]
fn initialize_notebook(notebook_path: String) -> Result<String, String> {
    let path = Path::new(&notebook_path);
    if !path.exists() {
        fs::create_dir_all(path)
            .map_err(|e| format!("Nie udało się utworzyć katalogu notatnika: {}", e))?;
    } else if !path.is_dir() {
        return Err("Wybrana ścieżka istnieje, ale nie jest katalogiem".to_string());
    }

    let files_dir = path.join("files");
    if !files_dir.exists() {
        fs::create_dir_all(&files_dir)
            .map_err(|e| format!("Nie udało się utworzyć katalogu na pliki: {}", e))?;
    }

    Ok(files_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn copy_file_to_notebook(notebook_path: String, file_path: String) -> Result<String, String> {
    let notebook = Path::new(&notebook_path);
    let source = Path::new(&file_path);

    if !source.exists() || !source.is_file() {
        return Err(format!("Plik źródłowy nie istnieje: {}", file_path));
    }

    let file_name = source.file_name()
        .ok_or_else(|| "Błędna nazwa pliku".to_string())?;

    let dest_dir = notebook.join("files");
    if !dest_dir.exists() {
        fs::create_dir_all(&dest_dir)
            .map_err(|e| format!("Nie udało się utworzyć katalogu na pliki: {}", e))?;
    }

    let mut dest_path = dest_dir.join(file_name);
    if dest_path.exists() {
        let stem = source.file_stem().unwrap_or_default().to_string_lossy().to_string();
        let extension = source.extension().unwrap_or_default().to_string_lossy().to_string();
        let mut counter = 1;
        while dest_path.exists() {
            let new_name = if extension.is_empty() {
                format!("{}_{}", stem, counter)
            } else {
                format!("{}_{}.{}", stem, counter, extension)
            };
            dest_path = dest_dir.join(new_name);
            counter += 1;
        }
    }

    fs::copy(source, &dest_path)
        .map_err(|e| format!("Blad podczas kopiowania pliku: {}", e))?;

    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
fn read_file_as_data_url(file_path: String) -> Result<String, String> {
    use std::io::Read;
    let path = Path::new(&file_path);
    if !path.exists() || !path.is_file() {
        return Err(format!("Plik nie istnieje: {}", file_path));
    }

    // Determine MIME type from extension
    let ext = path.extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let mime = match ext.as_str() {
        "mp4"  => "video/mp4",
        "webm" => "video/webm",
        "ogg"  => "video/ogg",
        "mov"  => "video/mp4",
        "avi"  => "video/mp4",
        "mkv"  => "video/webm",
        "mp3"  => "audio/mpeg",
        "wav"  => "audio/wav",
        "m4a"  => "audio/mp4",
        "flac" => "audio/flac",
        _      => "application/octet-stream",
    };

    let mut file = fs::File::open(path)
        .map_err(|e| format!("Blad otwarcia pliku: {}", e))?;
    let mut bytes = Vec::new();
    file.read_to_end(&mut bytes)
        .map_err(|e| format!("Blad odczytu pliku: {}", e))?;

    // Base64 encode
    let b64 = base64_encode(&bytes);
    Ok(format!("data:{};base64,{}", mime, b64))
}

// Simple base64 encoder (no external crate needed)
fn base64_encode(data: &[u8]) -> String {
    const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut result = String::with_capacity((data.len() + 2) / 3 * 4);
    let mut i = 0;
    while i < data.len() {
        let b0 = data[i] as u32;
        let b1 = if i + 1 < data.len() { data[i + 1] as u32 } else { 0 };
        let b2 = if i + 2 < data.len() { data[i + 2] as u32 } else { 0 };
        let n = (b0 << 16) | (b1 << 8) | b2;
        result.push(CHARS[((n >> 18) & 0x3f) as usize] as char);
        result.push(CHARS[((n >> 12) & 0x3f) as usize] as char);
        result.push(if i + 1 < data.len() { CHARS[((n >> 6) & 0x3f) as usize] as char } else { '=' });
        result.push(if i + 2 < data.len() { CHARS[(n & 0x3f) as usize] as char } else { '=' });
        i += 3;
    }
    result
}

#[tauri::command]
fn save_notebook_state(canvas_path: String, state_json: String) -> Result<(), String> {
    let path = Path::new(&canvas_path);
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            return Err("Katalog nadrzędny nie istnieje".to_string());
        }
    }

    fs::write(path, state_json)
        .map_err(|e| format!("Błąd podczas zapisu stanu planszy: {}", e))?;

    Ok(())
}

#[tauri::command]
fn load_notebook_state(canvas_path: String) -> Result<Option<String>, String> {
    let path = Path::new(&canvas_path);
    if path.exists() && path.is_file() {
        let content = fs::read_to_string(path)
            .map_err(|e| format!("Błąd podczas odczytu stanu planszy: {}", e))?;
        Ok(Some(content))
    } else {
        Ok(None)
    }
}

#[tauri::command]
fn export_notebook(state_json: String) -> Result<Option<String>, String> {
    let file_path = rfd::FileDialog::new()
        .set_title("Eksportuj notatnik jako plik JSON")
        .add_filter("JSON File", &["json"])
        .set_file_name("notatnik.json")
        .save_file();

    if let Some(path) = file_path {
        fs::write(&path, state_json)
            .map_err(|e| format!("Nie udało się zapisać pliku eksportu: {}", e))?;
        Ok(Some(path.to_string_lossy().to_string()))
    } else {
        Ok(None) // Anulowane przez użytkownika
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            update_block_position, 
            delete_block,
            select_notebook,
            select_plugin_file,
            initialize_notebook,
            copy_file_to_notebook,
            read_file_as_data_url,
            save_notebook_state,
            load_notebook_state,
            export_notebook,
            get_notebook_tree,
            create_notebook_dir,
            create_canvas_file,
            rename_notebook_item,
            delete_notebook_item,
            move_notebook_item
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
