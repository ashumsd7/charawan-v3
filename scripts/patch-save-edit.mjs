import fs from "fs";

const p = "src/app/manage-notifications/page.tsx";
let s = fs.readFileSync(p, "utf8");

const old = `  const saveEdit = async (): Promise<boolean> => {
    if (!editingKey) return false;
    const cleanTitle = editNewsTitle.trim();
    const cleanShort = editShortInfo.trim();
    if (!cleanTitle || !cleanShort) {
      pushToast({ type: "error", title: "फ़ॉर्म अधूरा", body: "शीर्षक और छोटा वि��रण लि��िए।" });
      return false;
    }

    const patch: FirebaseNewsItem = {
      reporterName: editReporterName.trim() || "Admin",
      newsTitle: cleanTitle,
      shortInfo: cleanShort,
      detailedInfo: editDetailedInfo.trim(),
      isAdmin: editIsAdmin,
      img1: editImg1.trim(),
      img2: editImg2.trim(),
    };

    try {
      await axios.patch(
        \`\${stripJson(CHARAWAN_NOTIFICATIONS_FIREBASE_URL)}/\${editingKey}.json\`,
        patch,
        { timeout: 25_000, headers: { "Content-Type": "application/json" } },
      );
      pushToast({ type: "success", title: "अपडेट हो गया", body: "�िकेशन अपडेट सेव हो गया।" });
      closeEdit();
      await callApi();
      return true;
    } catch {
      pushToast({ type: "error", title: "अपडेट नहीं हो सका", body: "इंटरनेट/सर्वर समस्या हो सकती है।" });
      return false;
    }
  };`;

const neu = `  const validateEditNotification = (): boolean => {
    const cleanTitle = editNewsTitle.trim();
    const cleanShort = editShortInfo.trim();
    if (!cleanTitle || !cleanShort) {
      pushToast({ type: "error", title: "फ़ॉर्म अधूरा", body: "शीर्षक और छ�िए।" });
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
        pushToast({ type: "success", title: "अपडेट हो गया", body: "नोटि��िकेशन अपडेट सेव हो गया।" });
      }, 0);
      return true;
    } catch {
      pushToast({ type: "error", title: "अपडेट नहीं हो सका", body: "इंटरनेट/सर्वर समस्या हो सकती है।" });
      return false;
    } finally {
      setEditSaveBusy(false);
    }
  };`;

if (!s.includes(old)) {
  console.error("old block not found");
  process.exit(1);
}
s = s.replace(old, neu);
fs.writeFileSync(p, s);
console.log("patched");
