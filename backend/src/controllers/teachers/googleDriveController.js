const { google } = require("googleapis");
const xlsx = require("xlsx");
const User = require("../../models/users");
const { getOAuth2Client } = require("../../utils/googleAuth");

const generateAuthUrl = async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ],
      state: req.query.userId || "",
    });

    res.status(200).json({ url });
  } catch (error) {
    console.error("Error generating auth url:", error);
    res
      .status(500)
      .json({
        message: "Failed to generate authentication URL",
        error: error.message,
      });
  }
};

const handleCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!userId) {
      return res.status(400).send("User ID is missing from state parameter.");
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const userInfo = await oauth2.userinfo.get();

    await User.findByIdAndUpdate(userId, {
      google_drive_email: userInfo.data.email,
      google_drive_id: userInfo.data.id,
      ...(tokens.refresh_token && {
        google_drive_refresh_token: tokens.refresh_token,
      }),
    });

    res.send(
      "<html><body><h2>Google Drive Connected Successfully!</h2><p>You can close this window and return to the application.</p><script>window.close();</script></body></html>",
    );
  } catch (error) {
    console.error("Error in handleCallback:", error);
    res.status(500).send("Failed to authenticate with Google Drive.");
  }
};

const listFiles = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?._id;
    const user = await User.findById(userId);

    if (!user || !user.google_drive_refresh_token) {
      return res
        .status(401)
        .json({ message: "Google Drive is not connected for this user." });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: user.google_drive_refresh_token,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' or mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' or mimeType='text/csv'",
      fields: "files(id, name, mimeType)",
      orderBy: "modifiedTime desc",
    });

    res.status(200).json(response.data.files);
  } catch (error) {
    console.error("Error listing files:", error);
    res
      .status(500)
      .json({
        message: "Failed to list Google Drive files",
        error: error.message,
      });
  }
};

const importData = async (req, res) => {
  try {
    const { fileId } = req.body;
    const userId = req.body.userId || req.user?._id;

    const user = await User.findById(userId);
    if (!user || !user.google_drive_refresh_token) {
      return res
        .status(401)
        .json({ message: "Google Drive is not connected for this user." });
    }

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      refresh_token: user.google_drive_refresh_token,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const fileMeta = await drive.files.get({
      fileId,
      fields: "mimeType, name",
    });
    const mimeType = fileMeta.data.mimeType;

    let buffer;

    if (mimeType === "application/vnd.google-apps.spreadsheet") {
      const response = await drive.files.export(
        {
          fileId,
          mimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        { responseType: "arraybuffer" },
      );
      buffer = Buffer.from(response.data);
    } else {
      const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "arraybuffer" },
      );
      buffer = Buffer.from(response.data);
    }

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetsData = {};
    let totalRows = 0;

    for (const sheetName of workbook.SheetNames) {
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      sheetsData[sheetName] = sheetData;
      totalRows += sheetData.length;
    }

    res.status(200).json({
      success: true,
      message: "File downloaded and parsed successfully.",
      fileName: fileMeta.data.name,
      rowCount: totalRows,
      data: sheetsData,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    res
      .status(500)
      .json({
        message: "Failed to import data from Google Drive",
        error: error.message,
      });
  }
};

module.exports = {
  generateAuthUrl,
  handleCallback,
  listFiles,
  importData,
};
