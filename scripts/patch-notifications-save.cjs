const fs = require("fs");
const path = "src/app/manage-notifications/page.tsx";
let s = fs.readFileSync(path, "utf8");

const errBody = "शीर्षक और छोट�िए।";
const okBody = "नोटि��िकेशन अपडेट सेव हो गया।";

const start = s.indexOf("  const saveEdit = async (): Promise<boolean> => {");
const end = s.indexOf("\n  const askDelete", start);
if (start < 0 || end < 0) {
  console.error("markers not found", start, end);
  process.exit(1);
}

const neu = `  const validateEditNotification = (): boolean => {
    const cleanTitle = editNewsTitle.trim();
    const cleanShort = editShortInfo.trim();
    if (!cleanTitle || !cleanShort) {
      pushToast({ type: "error", title: "फ़ॉर्म अधूरा", body: "${errBody}" });
      return false;
    }
    return true;
  };

  const saveEdit = async (): Promise<boolean> => {
    if (!editingKey) return false;
    if (editSaveBusy) return false;
    if (!validateEditNotification()) return false;

    const cleanTitle = editNewsTitle.trim();
    const cleanShort = editShortInfo.trim();
    const patch: FirebaseNewsItem = {
      reporterName: editReporterName.trim() || "Admin",
      newsTitle: cleanTitle,
      shortInfo: cleanShort,
      detailedInfo: editDetailedInfo.trim(),
      isAdmin: editIsAdmin,
      img1: editImg1.trim(),
      img2: editImg2.trim(),
    };

    setEditSaveBusy(true);
    try {
      await axios.patch(
        \`\${stripJson(CHARAWAN_NOTIFICATIONS_FIREBASE_URL)}/\${editingKey}.json\`,
        patch,
        { timeout: 25_000, headers: { "Content-Type": "application/json" } },
      );
      closeEdit();
      await callApi();
      window.setTimeout(() => {
        pushToast({ type: "success", title: "अपडेट हो गया", body: "${okBody}" });
      }, 0);
      return true;
    } catch {
      pushToast({ type: "error", title: "अपडेट नहीं हो सका", body: "इंटरनेट/सर्वर समस्या हो सकती है।" });
      return false;
    } finally {
      setEditSaveBusy(false);
    }
  };`;

s = s.slice(0, start) + neu + s.slice(end);
fs.writeFileSync(path, s);
console.log("patched");
