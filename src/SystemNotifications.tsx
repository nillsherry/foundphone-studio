import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { AppArtwork } from "./AppArtwork";
import type { Work } from "./schema";
const APP_ALIASES: Record<string, string> = {
  微信: "wechat",
  微博: "weibo",
  抖音: "douyin",
  LINE: "line",
  IG: "instagram",
  Instagram: "instagram",
  Threads: "threads",
  簡訊: "messages",
  短訊: "messages",
  備忘錄: "notes",
  提醒事項: "reminders",
  照片: "photos",
  電話: "phone",
  通訊錄: "contacts",
  郵件: "mail",
};
function matchAppId(sender: string, apps: Work["apps"]): string {
  const direct = apps.find((a) => a.name === sender);
  if (direct) return direct.id;
  const alias = APP_ALIASES[sender];
  if (alias) return alias;
  const s = sender.toLowerCase();
  const byPrefix = apps.find((a) => s.startsWith(a.id.toLowerCase()));
  if (byPrefix) return byPrefix.id;
  return "messages";
}
export function notificationContent(text: string, apps: Work["apps"]) {
  const separator = text.search(/[:：]/);
  const sender = separator > 0 ? text.slice(0, separator) : "信息";
  const app = apps.find((a) => a.name === sender);
  return {
    title: sender,
    body: separator > 0 ? text.slice(separator + 1) : text,
    appId: app?.id ?? matchAppId(sender, apps),
  };
}
export function SystemNotifications({
  notices,
  apps,
  onOpen,
  onDismiss,
  compact = false,
}: {
  notices: string[];
  apps: Work["apps"];
  onOpen: (appId: string) => void;
  onDismiss: (index: number) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const entries = notices.map((text, index) => ({ text, index })).reverse();
  const shown = compact && !expanded ? entries.slice(0, 1) : entries;
  return (
    <div
      className={
        "device-notices " +
        (compact && !expanded && notices.length > 1 ? "notice-stacked" : "")
      }
    >
      <div className="notice-cards">
        {shown.map(({ text, index }) => {
          const n = notificationContent(text, apps);
          return (
            <motion.div
              layout
              className="device-notice"
              key={text + "::" + index}
              initial={{ opacity: 0, y: 35, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) onDismiss(index);
              }}
            >
              <button
                className="notice-open"
                onClick={() => onOpen(n.appId)}
              >
                <span className="notice-app-art">
                  <AppArtwork id={n.appId} />
                </span>
                <span className="notice-copy">
                  <strong>{n.title}</strong>
                  <span>{n.body}</span>
                </span>
                <time>現在</time>
              </button>
              {!compact && (
                <button
                  className="notice-remove"
                  aria-label="清除通知"
                  onClick={() => onDismiss(index)}
                >
                  <X size={15} />
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
      {compact && notices.length > 1 && (
        <button
          className="notice-expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "收起" : notices.length + " 條通知"}
        </button>
      )}
    </div>
  );
}
