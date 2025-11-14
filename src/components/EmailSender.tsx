import { useState, useCallback, useEffect } from "react";
import { Send, Save } from "lucide-react";
import toast from "react-hot-toast";

interface EmailSenderProps {
  rendered: string;
}

export function EmailSender({ rendered }: EmailSenderProps) {
  const [recipientEmail, setRecipientEmail] = useState("umangsailor@gmail.com");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("ejs-viewer-recipient-email");
    if (savedEmail) {
      setRecipientEmail(savedEmail);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("ejs-viewer-recipient-email", recipientEmail);
  };

  const handleSendEmail = useCallback(async () => {
    if (!recipientEmail) {
      toast.error("Please provide recipient email");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/send-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: rendered,
            recipientEmail,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log(`Email sent successfully! Message ID: ${result.messageId}`);
        toast.success(
          `Email sent successfully! Message ID: ${result.messageId}`
        );
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      toast.error(
        `Error sending email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSending(false);
    }
  }, [rendered, recipientEmail]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Send Test Email
        </h3>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1.5 px-1.5 rounded flex items-center justify-center"
          title="Save Recipient Email to Local Storage"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            placeholder="recipient@example.com"
          />
        </div>

        <button
          onClick={handleSendEmail}
          disabled={isSending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isSending ? "Sending..." : "Send Email"}
        </button>
      </div>
    </div>
  );
}
