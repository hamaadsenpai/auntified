// Builds public/auntie-scam-check.shortcut: the iPhone Shortcut that forwards a text to POST /api/sms
// and shows Auntie's warning when it looks like a scam. On install, iOS asks for the URL and the
// Authorization header from Settings → iPhone SMS scam check.
//
//   node scripts/build-shortcut.mjs [default-url]
//
// macOS only: iPhones refuse unsigned shortcut files, and only the `shortcuts` CLI can sign them.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const DEFAULT_URL = process.argv[2] ?? "https://your-app.example.com/api/sms";
const OUT = new URL("../public/auntie-scam-check.shortcut", import.meta.url).pathname;

const uuid = () => randomUUID().toUpperCase();
const ids = { url: uuid(), key: uuid(), post: uuid(), show: uuid(), note: uuid(), group: uuid() };

const output = (OutputUUID, OutputName) => ({ Type: "ActionOutput", OutputUUID, OutputName });
const INPUT = { Type: "ExtensionInput" };

/** A text field that is exactly one variable. */
const tokenString = (attachment) => ({
  Value: { string: "￼", attachmentsByRange: { "{0, 1}": attachment } },
  WFSerializationType: "WFTextTokenString",
});
const plainString = (string) => ({ Value: { string, attachmentsByRange: {} }, WFSerializationType: "WFTextTokenString" });
const tokenAttachment = (attachment) => ({ Value: attachment, WFSerializationType: "WFTextTokenAttachment" });
const dictionary = (items) => ({
  Value: { WFDictionaryFieldValueItems: items.map(([key, value]) => ({ WFItemType: 0, WFKey: plainString(key), WFValue: value })) },
  WFSerializationType: "WFDictionaryFieldValue",
});
const action = (id, parameters) => ({ WFWorkflowActionIdentifier: `is.workflow.actions.${id}`, WFWorkflowActionParameters: parameters });

const actions = [
  // 0, 1: filled in by the import questions below.
  action("gettext", { UUID: ids.url, WFTextActionText: DEFAULT_URL }),
  action("gettext", { UUID: ids.key, WFTextActionText: "Bearer aunt_" }),
  action("downloadurl", {
    UUID: ids.post,
    WFURL: tokenString(output(ids.url, "Text")),
    WFHTTPMethod: "POST",
    ShowHeaders: true,
    WFHTTPHeaders: dictionary([
      ["Authorization", tokenString(output(ids.key, "Text"))],
      // Lets the request through ngrok's free-plan warning page; harmless elsewhere.
      ["ngrok-skip-browser-warning", plainString("true")],
    ]),
    WFHTTPBodyType: "JSON",
    WFJSONValues: dictionary([["message", tokenString(INPUT)]]),
  }),
  // Every reply, errors included, has data.show ("yes", or null for nothing to say) and data.notification.
  action("getvalueforkey", {
    UUID: ids.show,
    WFGetDictionaryValueType: "Value",
    WFDictionaryKey: "data.show",
    WFInput: tokenAttachment(output(ids.post, "Contents of URL")),
  }),
  action("conditional", {
    GroupingIdentifier: ids.group,
    WFControlFlowMode: 0,
    WFInput: { Type: "Variable", Variable: tokenAttachment(output(ids.show, "Dictionary Value")) },
    WFCondition: 100, // has any value: needs no extra parameter, so it imports cleanly
  }),
  action("getvalueforkey", {
    UUID: ids.note,
    WFGetDictionaryValueType: "Value",
    WFDictionaryKey: "data.notification",
    WFInput: tokenAttachment(output(ids.post, "Contents of URL")),
  }),
  action("notification", {
    WFNotificationActionTitle: "Auntie",
    WFNotificationActionBody: tokenString(output(ids.note, "Dictionary Value")),
    WFNotificationActionSound: true,
  }),
  action("conditional", { GroupingIdentifier: ids.group, WFControlFlowMode: 1 }),
  action("conditional", { GroupingIdentifier: ids.group, WFControlFlowMode: 2 }),
];

const shortcut = {
  WFWorkflowClientVersion: "2607.0.2",
  WFWorkflowMinimumClientVersion: 900,
  WFWorkflowMinimumClientVersionString: "900",
  WFWorkflowIcon: { WFWorkflowIconStartColor: 4282601983, WFWorkflowIconGlyphNumber: 59511 },
  WFWorkflowTypes: [],
  WFWorkflowHasShortcutInputVariables: true,
  // The full "any input" list a hand-made shortcut gets, so the Message automation's input isn't filtered out.
  WFWorkflowInputContentItemClasses: [
    "WFAppContentItem",
    "WFAppStoreAppContentItem",
    "WFArticleContentItem",
    "WFContactContentItem",
    "WFDateContentItem",
    "WFEmailAddressContentItem",
    "WFFolderContentItem",
    "WFGenericFileContentItem",
    "WFImageContentItem",
    "WFiTunesProductContentItem",
    "WFLocationContentItem",
    "WFDCMapsLinkContentItem",
    "WFAVAssetContentItem",
    "WFPDFContentItem",
    "WFPhoneNumberContentItem",
    "WFRichTextContentItem",
    "WFSafariWebPageContentItem",
    "WFStringContentItem",
    "WFURLContentItem",
  ],
  WFWorkflowOutputContentItemClasses: [],
  WFWorkflowImportQuestions: [
    {
      ActionIndex: 0,
      Category: "Parameter",
      ParameterKey: "WFTextActionText",
      Text: "Paste the URL from Auntified → Settings → iPhone SMS scam check",
      DefaultValue: DEFAULT_URL,
    },
    {
      ActionIndex: 1,
      Category: "Parameter",
      ParameterKey: "WFTextActionText",
      Text: "Paste the Authorization header (starts with Bearer aunt_)",
      DefaultValue: "",
    },
  ],
  WFWorkflowActions: actions,
};

const dir = mkdtempSync(join(tmpdir(), "shortcut-"));
const unsigned = join(dir, "unsigned.shortcut");
writeFileSync(unsigned, JSON.stringify(shortcut));
execFileSync("plutil", ["-convert", "binary1", unsigned]);
mkdirSync(dirname(OUT), { recursive: true });
execFileSync("shortcuts", ["sign", "--mode", "anyone", "--input", unsigned, "--output", OUT], { stdio: "inherit" });
console.log(`Signed shortcut written to ${OUT}`);
