package com.example.cdr.eventsmanagementsystem.Util;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component
public class ImageUtil {
    public List<byte[]> extractImageData(List<MultipartFile> files) throws IOException {
        if (Objects.isNull(files)) return Collections.emptyList();

        List<byte[]> imageData = new ArrayList<>();
        for (MultipartFile file : files) {
            if (Objects.nonNull(file) && !file.isEmpty()) {
                imageData.add(file.getBytes());
            }
        }
        return imageData;
    }
    public List<byte[]> mergeImages(List<byte[]> existingImages, List<MultipartFile> newImages) throws IOException {
        List<byte[]> merged = Objects.nonNull(existingImages) ? new ArrayList<>(existingImages) : new ArrayList<>();
        merged.addAll(extractImageData(newImages));
        return merged;
    }
}
