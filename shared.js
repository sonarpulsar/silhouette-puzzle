// Shared helpers used by every page.
// Loads the Supabase client and connects the tablet + projector
// to the same realtime channel.

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Connects to the shared channel.
//   onMessage(payload)  -> called on the DISPLAY when the tablet sends something
// Returns an object with .send(action, data) used by the CONTROL page.
function connectChannel(onMessage) {
  const channel = supabaseClient.channel(CHANNEL_NAME, {
    config: { broadcast: { self: false } },
  });

  channel.on("broadcast", { event: "control" }, (msg) => {
    if (onMessage) onMessage(msg.payload);
  });

  channel.subscribe((status) => {
    console.log("Channel status:", status);
    const dot = document.getElementById("status-dot");
    if (dot) {
      dot.classList.toggle("online", status === "SUBSCRIBED");
      dot.title = status;
    }
  });

  return {
    send(action, data = {}) {
      channel.send({
        type: "broadcast",
        event: "control",
        payload: { action, ...data, at: Date.now() },
      });
    },
  };
}
