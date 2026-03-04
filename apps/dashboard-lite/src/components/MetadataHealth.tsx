"use client";

export function MetadataHealth() {
    // Mapping to merchantInventory.ts diagnostic checkProductImageHealth and GTIN
    const checks = [
        { name: "GTIN Identifier Exists (Paradox Check)", status: "Pass", value: "Valid mapping" },
        { name: "Local Feed Verification", status: "Pass", value: "Active UCP Feed" },
        { name: "Image Health Diagnostics", status: "Warn", value: "Promotional Overlays Detected" },
    ];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Metadata & GTIN Validator
            </h2>
            <div className="space-y-4 text-sm">
                {checks.map((check, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-zinc-950 rounded border border-zinc-800/60">
                        <div>
                            <div className="font-semibold text-zinc-300">{check.name}</div>
                            <div className="text-xs text-zinc-500">{check.value}</div>
                        </div>
                        {check.status === "Pass" ? (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded text-xs font-bold uppercase">Pass</span>
                        ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded text-xs font-bold uppercase">Warn</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
