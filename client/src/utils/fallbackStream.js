import toast from "react-hot-toast";

export const getMediaStreamWithFallback = async (needVideo = false) => {
    try {
        // Try getting real hardware stream first
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: needVideo,
        });
        return { stream, isFallback: false };
    } catch (error) {
        console.warn("Real hardware getUserMedia failed, attempting fallback:", error);

        if (needVideo) {
            try {
                // If video failed, get audio-only hardware stream first
                const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

                // Create a simulated canvas video stream
                const canvas = document.createElement("canvas");
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext("2d");
                
                let angle = 0;
                const animInterval = setInterval(() => {
                    if (canvas.parentNode === null && !canvasStream.active) {
                        clearInterval(animInterval);
                    }
                    ctx.fillStyle = "#0a0a14";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Pulse gradient ring
                    const grad = ctx.createRadialGradient(
                        canvas.width / 2, canvas.height / 2 - 30, 20,
                        canvas.width / 2, canvas.height / 2 - 30, 80 + Math.sin(angle * 0.05) * 15
                    );
                    grad.addColorStop(0, "#6c63ff");
                    grad.addColorStop(1, "#0a0a14");
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2 - 30, 100, 0, Math.PI * 2);
                    ctx.fill();

                    // Camera icon or status
                    ctx.fillStyle = "#ffffff";
                    ctx.font = "bold 22px Inter, sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("Webcam Busy / Blocked", canvas.width / 2, canvas.height / 2 + 70);

                    ctx.fillStyle = "#00d4ff";
                    ctx.font = "14px Inter, sans-serif";
                    ctx.fillText("Simulating Video Stream (Testing Mode)", canvas.width / 2, canvas.height / 2 + 105);

                    angle += 1;
                }, 40);

                const canvasStream = canvas.captureStream(25); // 25 FPS
                
                // Combine real audio track with mock video track
                const stream = new MediaStream([
                    ...audioStream.getAudioTracks(),
                    ...canvasStream.getVideoTracks()
                ]);

                // Store interval reference to clear it when tracks stop
                stream.getVideoTracks()[0].addEventListener("ended", () => {
                    clearInterval(animInterval);
                });

                toast.success("Camera locked. Started call with Simulated Video Stream!");
                return { stream, isFallback: true };
            } catch (audioError) {
                console.error("Audio capture also failed:", audioError);
                throw audioError;
            }
        }
        
        throw error;
    }
};
