package com.example.cdr.eventsmanagementsystem.Model.Service;

import java.util.List;

public enum ServiceDescription {
    CATERING_SERVICES(List.of(
            "Full meal service (buffet, seated dinner)",
            "Light snacks and beverages",
            "Coffee and dessert stations",
            "Food trucks or live cooking stations"
    )),

    DECOR_AND_STYLING(List.of(
            "Thematic decoration (e.g., weddings, corporate branding)",
            "Floral arrangements",
            "Stage design and backdrops",
            "Lighting decoration (mood/ambient lighting, balloons)"
    )),

    AUDIO_VISUAL_SERVICES(List.of(
            "Sound systems (speakers, mics, mixers)",
            "Projectors and LED screens",
            "Lighting rigs and effects",
            "Live streaming equipment",
            "Video recording / photography"
    )),

    FURNITURE_EQUIPMENT_RENTAL(List.of(
            "Chairs and tables",
            "Tents and canopies (for outdoor events)",
            "Stages or podiums",
            "Dance floors",
            "Booths or exhibition stands"
    ));

    private final List<String> descriptions;
    ServiceDescription(List<String> descriptions) {
        this.descriptions = descriptions;
    }
    public List<String> getDescriptions() {
        return descriptions;
    }
}

