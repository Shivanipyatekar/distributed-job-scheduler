import {
  Check,
  Copy,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../../components/ui/Button";

const ApiKeyReveal = ({
  projectName,
  apiKey,
  onContinue,
}) => {
  const copyButtonRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    copyButtonRef.current?.focus();
  }, []);

  const handleCopy = async () => {
    setCopyError("");

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
    } catch {
      setCopyError(
        "Automatic copying failed. Select and copy the key manually.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/25 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
        className="w-full max-w-xl rounded-[24px] border border-line bg-surface p-6 shadow-panel sm:p-8"
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-warning-soft text-warning">
          <KeyRound className="size-6" aria-hidden="true" />
        </span>

        <p className="mt-6 font-mono text-[0.68rem] font-semibold tracking-[0.18em] text-warning">
          ONE-TIME CREDENTIAL
        </p>

        <h2
          id="api-key-title"
          className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink"
        >
          Save the API key for {projectName}
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted">
          This key will not be returned by the server again. Store it securely
          before continuing.
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-canvas p-4">
          <code className="block select-all break-all font-mono text-sm leading-6 text-ink">
            {apiKey}
          </code>

          <Button
            ref={copyButtonRef}
            variant="secondary"
            className="mt-4 w-full"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="size-4 text-success" aria-hidden="true" />
                Copied to clipboard
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden="true" />
                Copy API key
              </>
            )}
          </Button>

          {copyError && (
            <p className="mt-3 text-sm text-danger">{copyError}</p>
          )}
        </div>

        <div className="mt-5 flex gap-3 rounded-xl border border-warning/20 bg-warning-soft px-4 py-3">
          <ShieldAlert
            className="mt-0.5 size-5 shrink-0 text-warning"
            aria-hidden="true"
          />

          <p className="text-sm leading-6 text-warning">
            Never place this key in frontend source code or commit it to Git.
            Use it only from trusted workers or server-side applications.
          </p>
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) =>
              setAcknowledged(event.target.checked)
            }
            className="mt-0.5 size-4 accent-brand"
          />

          <span>I have saved this API key somewhere secure.</span>
        </label>

        <Button
          className="mt-6 w-full"
          disabled={!acknowledged}
          onClick={onContinue}
        >
          Continue to project
        </Button>
      </section>
    </div>
  );
};

export default ApiKeyReveal;
