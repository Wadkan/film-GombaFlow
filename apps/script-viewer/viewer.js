const module = { exports: {} };
/* CORE_SOURCE */
const core = module.exports;
let parts = [],
    index = -1,
    recorded = new Set(),
    types = { narration: true, screen: true, note: true };
let currentTopic = null,
    currentPrefs = null,
    displayedPartKey = null,
    savedTopics = [];
const topics = new Map();
const $ = (id) => document.getElementById(id);
const escapeHTML = (s) =>
    String(s ?? "").replace(
        /[&<>"']/g,
        (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[c]),
    );
window.viewerHost = window.viewerHost || { send: async () => ({ ok: true }) };
async function send(action) {
    const result = await window.viewerHost.send(action);
    if (!result || result.ok === false) {
        throw Error(result?.error || "A mentés nem sikerült");
    }
    if (result.state?.topics) savedTopics = Object.keys(result.state.topics);
    return result;
}
function preferences() {
    return {
        chapter: $("chapter").value,
        clip: $("clip").value,
        location: $("location").value,
        status: $("status").value === "no"
            ? "not-recorded"
            : $("status").value === "yes"
            ? "recorded"
            : "all",
        search: $("search").value,
        types: { ...types },
        topCollapsed: topbar.hidden,
        bottomCollapsed: bottombar.hidden,
    };
}
async function savePreferences() {
    await send({
        type: "preferences",
        topicId: currentTopic,
        value: preferences(),
    });
}
function fillFilter(id, values, label) {
    const el = $(id);
    for (const value of values) {
        const o = document.createElement("option");
        o.value = value;
        o.textContent = label ? label(value) : value;
        el.appendChild(o);
    }
}
function matches() {
    const q = $("search").value.toLocaleLowerCase("hu");
    return parts.filter((p) =>
        ($("chapter").value === "all" || p.chapter === $("chapter").value) &&
        ($("clip").value === "all" || p.clip === $("clip").value) &&
        ($("location").value === "all" || $("location").value === p.location) &&
        ($("status").value === "all" ||
            ($("status").value === "yes") === recorded.has(p.id)) &&
        (!q || p.narration.toLocaleLowerCase("hu").includes(q))
    );
}
window.viewerOpen = (markdown, saved = {}) => {
    const parsed = core.parseScript(markdown);
    currentTopic = parsed.topicId;
    currentPrefs = saved.preferences || null;
    savedTopics = saved.topics || [];
    recorded = new Set(
        Object.entries(saved.recorded || {}).filter(([, value]) =>
            value === true
        ).map(([id]) => Number(id)),
    );
    types = {
        narration: true,
        screen: true,
        note: true,
        ...(currentPrefs?.types || {}),
    };
    parts = parsed.parts.map((p) => ({
        ...p,
        clip: p.clipType,
        cue: p.spokenCue,
        screen: p.screenAction,
        note: [...p.chapterNotes, ...p.productionNotes].join("\n\n"),
    }));
    for (const id of ["chapter", "clip", "location"]) {
        const label =
            { chapter: "fejezet", clip: "típus", location: "helyszín" }[id];
        $(id).replaceChildren(new Option("Minden " + label, "all"));
        fillFilter(
            id,
            [...new Set(parts.map((p) => p[id]))],
            id === "location" ? (v) => "Helyszín " + v : null,
        );
    }
    index = parts.findIndex((p) => String(p.id) === String(saved.partId));
    if (index < 0) index = 0;
    if (currentPrefs) {
        for (const id of ["chapter", "clip", "location", "search"]) {
            if (currentPrefs[id] !== undefined) {
                const el = $(id), value = currentPrefs[id];
                if (
                    id !== "search" && value !== "all" &&
                    ![...el.options].some((o) => o.value === value)
                ) {
                    const option = new Option("Nem elérhető: " + value, value);
                    el.add(option);
                }
                el.value = value;
            }
        }
        $("status").value = currentPrefs.status === "not-recorded"
            ? "no"
            : currentPrefs.status === "recorded"
            ? "yes"
            : currentPrefs.status || "all";
    } else $("status").value = "no";
    applyBarState(
        currentPrefs?.topCollapsed === true,
        currentPrefs?.bottomCollapsed === true,
    );
    render();
};
window.viewerShowLibrary = (view = {}) => {
    const list = view.topics || [];
    $("content").innerHTML = `<div class=\"empty\"><h1>Scriptek</h1>${
        list.length
            ? list.map((id) =>
                `<section class=\"block\"><strong>${
                    escapeHTML(id)
                }</strong><div><button data-open=\"${
                    escapeHTML(id)
                }\">Megnyitás</button> <button data-delete=\"${
                    escapeHTML(id)
                }\">Törlés</button></div></section>`
            ).join("")
            : "<p>Nincs mentett script</p>"
    }<button id=\"pickScript\">Másik MD megnyitása…</button></div>`;
    $("partDetails").hidden = true;
    $("cue").textContent = "Offline könyvtár";
    $("record").disabled = true;
    $("prev").disabled = true;
    $("next").disabled = true;
    document.querySelectorAll("[data-open]").forEach((b) =>
        b.onclick = () =>
            window.viewerHost.send({
                type: "open-topic",
                topicId: b.dataset.open,
            }).catch(window.viewerShowError)
    );
    document.querySelectorAll("[data-delete]").forEach((b) =>
        b.onclick = () => {
            const id = b.dataset.delete;
            window.viewerHost.send({ type: "delete", topicId: id }).then(
                (a) => {
                    if (a.state) {
                        window.viewerShowLibrary({
                            topics: Object.keys(a.state.topics || {}),
                        });
                    }
                },
            ).catch(window.viewerShowError);
        }
    );
    $("pickScript").onclick = () =>
        window.viewerHost.send({ type: "open-md" }).catch(
            window.viewerShowError,
        );
};
const topbar = document.querySelector(".top"),
    bottombar = document.querySelector(".bottom");
function applyBarState(topCollapsed, bottomCollapsed) {
    topbar.hidden = topCollapsed;
    bottombar.hidden = bottomCollapsed;
    $("toggleBottom").setAttribute("aria-expanded", String(!bottomCollapsed));
}
let savingBars = false;
async function saveBarState(topCollapsed, bottomCollapsed) {
    if (savingBars) return;
    savingBars = true;
    const previous = [topbar.hidden, bottombar.hidden];
    applyBarState(topCollapsed, bottomCollapsed);
    try {
        await savePreferences();
    } catch (error) {
        applyBarState(...previous);
        window.viewerShowError(error);
    } finally {
        savingBars = false;
    }
}
$("showTop").onclick = () => saveBarState(!topbar.hidden, bottombar.hidden);
$("toggleBottom").onclick = () =>
    saveBarState(topbar.hidden, !bottombar.hidden);

function render() {
    const list = matches();
    if (!list.some((p) => p.id === parts[index]?.id)) {
        index = list.length ? parts.indexOf(list[0]) : -1;
    }
    const p = parts[index];
    const partDetails = $("partDetails");
    partDetails.hidden = !p;
    partDetails.textContent = p
        ? `#${p.id} - ${p.chapter} · ${p.clip} · Helyszín ${p.location}`
        : "";
    $("content").innerHTML = p
        ? `${
            types.narration
                ? `<section class="block"><h3>Narráció</h3><p>${
                    escapeHTML(p.narration)
                }</p></section>`
                : ""
        }${
            types.screen
                ? `<section class="block"><h3>Képernyő-akció</h3><p>${
                    escapeHTML(p.screen)
                }</p></section>`
                : ""
        }${
            types.note
                ? `<aside class="note">${escapeHTML(p.note)}</aside>`
                : ""
        }`
        : `<div class="empty"><h2>Nincs találat</h2><p>A szűréshez nincs illő rész.</p><button id="allStatuses">Minden felvételi állapot mutatása</button></div>`;
    $("cue").textContent = p ? p.cue : "Nincs kiválasztott rész";
    $("record").checked = !!p && recorded.has(p.id);
    $("record").disabled = !p;
    $("prev").disabled = !p || list[0]?.id === p.id;
    $("next").disabled = !p || list.at(-1)?.id === p.id;
    $("results").innerHTML = list.map((x) =>
        `<button class="result" data-id="${x.id}">#${x.id} · ${
            escapeHTML(x.chapter)
        }<br><span style="color:#52645a">${
            escapeHTML(x.narration.slice(0, 90))
        }</span></button>`
    ).join("");
    document.querySelectorAll(".result").forEach((b) =>
        b.onclick = async () => {
            const target = parts.find((x) => x.id === +b.dataset.id);
            try {
                await send({
                    type: "cursor",
                    topicId: currentTopic,
                    id: String(target.id),
                });
                index = parts.indexOf(target);
                $("results").classList.remove("open");
                render();
            } catch (e) {
                window.viewerShowError(e);
            }
        }
    );
    const all = $("allStatuses");
    if (all) {
        all.onclick = async () => {
            try {
                $("status").value = "all";
                await savePreferences();
                render();
            } catch (e) {
                window.viewerShowError(e);
            }
        };
    }
    const key = p ? currentTopic + ":" + p.id : null;
    if (key !== displayedPartKey) {
        displayedPartKey = key;
        reader.scrollTop = 0;
    }
}
async function move(delta) {
    const list = matches(),
        i = list.findIndex((p) => parts.indexOf(p) === index),
        target = list[Math.max(0, Math.min(list.length - 1, i + delta))];
    if (!target) return;
    try {
        await send({
            type: "cursor",
            topicId: currentTopic,
            id: String(target.id),
        });
        index = parts.indexOf(target);
        render();
    } catch (e) {
        window.viewerShowError(e);
    }
}
$("record").onchange = async () => {
    const part = parts[index];
    if (!part) return;
    const value = $("record").checked;
    try {
        await send({
            type: "record",
            topicId: currentTopic,
            id: String(part.id),
            value,
        });
        if (value) recorded.add(part.id);
        else recorded.delete(part.id);
        const rest = matches(),
            next = rest.find((x) => parts.indexOf(x) > index) || rest[0];
        if (!rest.some((x) => x.id === part.id)) {
            if (next) {
                await send({
                    type: "cursor",
                    topicId: currentTopic,
                    id: String(next.id),
                });
            }
            index = next ? parts.indexOf(next) : -1;
        }
        render();
    } catch (e) {
        $("record").checked = !value;
        window.viewerShowError(e);
    }
};
for (const id of ["chapter", "clip", "location", "status"]) {
    $(id).addEventListener("change", async () => {
        try {
            await savePreferences();
            render();
        } catch (e) {
            window.viewerShowError(e);
        }
    });
}
let searchTimer = null;
$("search").addEventListener("input", () => {
    $("results").classList.add("open");
    render();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
        () => savePreferences().catch(window.viewerShowError),
        250,
    );
});
$("search").onfocus = () => $("results").classList.add("open");
$("prev").onclick = () => move(-1);
$("next").onclick = () => move(1);
let touch = null;
const reader = $("content");
reader.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
        touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
}, { passive: true });
reader.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x,
        dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2) {
        move(dx < 0 ? 1 : -1);
    }
}, { passive: true });
function sheet(title, html) {
    $("sheetTitle").textContent = title;
    $("sheetBody").innerHTML = html;
    $("dialog").classList.add("open");
}
$("closeSheet").onclick = () => $("dialog").classList.remove("open");
$("typesBtn").onclick = () => {
    sheet(
        "Tartalomtípusok",
        `<div class="types"><label><input type="checkbox" data-type="narration" ${
            types.narration ? "checked" : ""
        }> Narráció</label><label><input type="checkbox" data-type="screen" ${
            types.screen ? "checked" : ""
        }> Képernyő-akció</label><label><input type="checkbox" data-type="note" ${
            types.note ? "checked" : ""
        }> Gyártási megjegyzés</label><p>A beszélt cue mindig látható marad.</p></div>`,
    );
    document.querySelectorAll("[data-type]").forEach((c) =>
        c.onchange = async () => {
            types[c.dataset.type] = c.checked;
            try {
                await savePreferences();
                render();
            } catch (e) {
                window.viewerShowError(e);
            }
        }
    );
};
$("libraryBtn").textContent = "Scriptek";
$("libraryBtn").onclick = () =>
    window.viewerShowLibrary({ topics: savedTopics });
window.viewerDiagnosticState.ready = true;
window.viewerDiagnosticState.stage = "Olvasó kész";
