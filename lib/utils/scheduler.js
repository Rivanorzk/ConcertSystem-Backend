import cron from "node-cron";
import { publishDueEventsAndNotify } from "../services/ticketOpeningService.js";

const SCHEDULE = "* * * * *";

// State job untuk System Console (in-memory, reset saat restart).
const publishJob = {
    name: "Publikasi otomatis event",
    schedule: SCHEDULE,
    description: "Mempublikasikan event draft yang waktu penjualannya sudah tiba dan mengirim notifikasi.",
    runs: 0,
    total_published: 0,
    last_run_at: null,
    last_duration_ms: null,
    last_published: 0,
    last_error: null,
    last_error_at: null,
};

export function getSchedulerStatus() {
    return [{ ...publishJob }];
}

export function startScheduler() {
    // Jalan tiap 1 menit — cukup presisi karena sales_start_at cuma
    // punya granularitas menit
    cron.schedule(SCHEDULE, async () => {
        const started = Date.now();
        try {
            const count = await publishDueEventsAndNotify();
            publishJob.last_published = count;
            publishJob.total_published += count;
            publishJob.last_error = null;
            if (count > 0) {
                console.log(`[scheduler] ${count} event dipublikasikan otomatis.`);
            }
        } catch (err) {
            publishJob.last_error = err.message;
            publishJob.last_error_at = new Date().toISOString();
            console.error("[scheduler] Gagal jalankan job publish event:", err.message);
        } finally {
            publishJob.runs += 1;
            publishJob.last_run_at = new Date().toISOString();
            publishJob.last_duration_ms = Date.now() - started;
        }
    });
}