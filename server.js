const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const alerts = [];

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        service: "CrisisMesh API",
        status: "ONLINE",
        version: "1.0.0"
    });
});

// Health endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        status: "ONLINE",
        alerts: alerts.length,
        timestamp: new Date().toISOString()
    });
});

// Receive SOS from Android gateway
app.post("/api/v1/sos", (req, res) => {
    console.log("\n========== CRISISMESH SOS ==========");

    const sos = {
        id: req.body.messageId || `SOS-${Date.now()}`,
        messageId: req.body.messageId || null,

        originDeviceId:
            req.body.originDeviceId || "UNKNOWN",

        gatewayDeviceId:
            req.body.gatewayDeviceId || "UNKNOWN",

        message:
            req.body.message || "Emergency SOS",

        emergencyType:
            req.body.emergencyType || "GENERAL_EMERGENCY",

        latitude:
            req.body.latitude ?? null,

        longitude:
            req.body.longitude ?? null,

        accuracy:
            req.body.accuracy ?? null,

        hopCount:
            req.body.hopCount ?? 0,

        ttl:
            req.body.ttl ?? 10,

        timestamp:
            req.body.timestamp || new Date().toISOString(),

        receivedAt:
            new Date().toISOString(),

        status: "ACTIVE"
    };

    alerts.unshift(sos);

    // Keep latest 100 alerts
    if (alerts.length > 100) {
        alerts.pop();
    }

    console.log(sos);

    res.status(200).json({
        success: true,
        message: "SOS received successfully",
        sosId: sos.id,
        status: "ACTIVE"
    });
});

// Get all SOS alerts
app.get("/api/v1/sos", (req, res) => {
    res.json({
        success: true,
        count: alerts.length,
        alerts
    });
});

// Get latest SOS
app.get("/api/v1/sos/latest", (req, res) => {
    res.json({
        success: true,
        alert: alerts.length > 0 ? alerts[0] : null
    });
});

// Start server locally
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CrisisMesh server running on port ${PORT}`);
});