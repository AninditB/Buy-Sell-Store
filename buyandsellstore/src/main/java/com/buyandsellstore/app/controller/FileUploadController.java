package com.buyandsellstore.app.controller;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = { RequestMethod.POST, RequestMethod.OPTIONS })
public class FileUploadController {

    // where on disk to store uploads
    private static final Path UPLOAD_DIR = Paths.get("uploads");

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> handleFileUpload(
            @RequestParam("file") MultipartFile file) throws IOException {

        // ensure the directory exists
        if (!Files.exists(UPLOAD_DIR)) {
            Files.createDirectories(UPLOAD_DIR);
        }

        // generate a unique filename
        String filename = UUID.randomUUID() + "-" + file.getOriginalFilename();
        Path destination = UPLOAD_DIR.resolve(filename);

        // copy the file data to disk
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        // return the URL where the file can be fetched
        // (we’ll serve static resources from /uploads/** below)
        String url = "/uploads/" + filename;
        return ResponseEntity.ok(Collections.singletonMap("url", url));
    }
}
