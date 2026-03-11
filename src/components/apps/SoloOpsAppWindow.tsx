"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  FileText,
  HardDrive,
  Rocket,
  Share2,
  Video,
} from "lucide-react";

import type { AppId, AppWindowProps } from "@/apps/types";
import { AppWindowShell } from "@/components/windows/AppWindowShell";
import {
  deletePlaybook,
  importPlaybooksFromText,
  loadPlaybooks,
  type Playbook,
  type PlaybookAction,
  createPlaybook,
} from "@/lib/playbooks";
import { requestOpenApp } from "@/lib/ui-events";

type Step = {
  title: string;
  desc: string;
  apps: Array<{ id: AppId; label: string }>;
};

export function SoloOpsAppWindow({
  state,
  zIndex,
  active,
  onFocus,
  onMinimize,
  onClose,
}: AppWindowProps) {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 1800);
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败（浏览器权限）");
    }
  }, [showToast]);

  const [myPlaybooks, setMyPlaybooks] = useState<Playbook[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");

  const refreshPlaybooks = useCallback(() => {
    setMyPlaybooks(loadPlaybooks());
  }, []);

  useEffect(() => {
    refreshPlaybooks();
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("openclaw.playbooks")) refreshPlaybooks();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshPlaybooks]);

  const steps: Step[] = useMemo(
    () => [
      {
        title: "1) 定位与选题",
        desc: "明确目标用户、痛点、卖点；把选题沉淀成可复用资产。",
        apps: [
          { id: "knowledge_vault", label: "知识库" },
          { id: "task_manager", label: "任务调度" },
        ],
      },
      {
        title: "2) 生成内容包",
        desc: "一份选题同时产出：小红书/抖音脚本/公众号长文（可按平台再细化）。",
        apps: [
          { id: "media_ops", label: "AI 文案" },
          { id: "creative_studio", label: "AI 视觉工坊" },
        ],
      },
      {
        title: "3) 矩阵分发",
        desc: "选择平台、检查合规与排版；优先走“安全发布预演”，再逐步接入自动发布。",
        apps: [
          { id: "publisher", label: "矩阵发布中心" },
          { id: "account_center", label: "授权中心" },
        ],
      },
      {
        title: "4) 复盘迭代",
        desc: "把有效的开头、标题、话术沉淀为模板；形成可复用的内容增长闭环。",
        apps: [
          { id: "knowledge_vault", label: "知识库" },
          { id: "settings", label: "设置" },
        ],
      },
    ],
    [],
  );

  type BuiltinPlaybook = {
    title: string;
    desc: string;
    icon: ReactNode;
    actions: PlaybookAction[];
  };

  const builtInPlaybooks: BuiltinPlaybook[] = useMemo(
    () => [
      {
        title: "矩阵内容增长（小红书/抖音/Ins/TikTok）",
        desc: "一份选题产出 4 端版本 + 封面 + 发布清单；先预演再自动化。",
        icon: <Share2 className="h-4 w-4 text-emerald-600" />,
        actions: [
          {
            type: "open_app",
            appId: "media_ops",
            label: "打开 AI 文案",
          },
          {
            type: "open_app",
            appId: "publisher",
            label: "打开 发布中心",
          },
          {
            type: "copy",
            label: "复制指令",
            text:
              "请把以下选题做成矩阵内容包：\n" +
              "1) 小红书：标题 3 个 + 正文 + 话题标签\n" +
              "2) 抖音：口播脚本 + 字幕要点 + 结尾关注引导\n" +
              "3) Instagram：短文 + hashtag\n" +
              "4) TikTok：强钩子 + 快节奏脚本\n" +
              "选题：<在这里填你的主题/产品卖点>\n" +
              "目标用户：<在这里填>\n" +
              "约束：避免夸大、可直接发布。",
          },
        ],
      },
      {
        title: "视频再利用（封面 + 高光剪辑）",
        desc: "把长视频快速剪成高光片段，并导出封面图用于各平台。",
        icon: <Video className="h-4 w-4 text-indigo-600" />,
        actions: [
          {
            type: "open_app",
            appId: "creative_studio",
            label: "打开 视觉工坊",
          },
          {
            type: "copy",
            label: "复制指令",
            text:
              "请从视频中提取封面并剪出 15 秒高光片段：\n" +
              "- 封面：第 10 秒，文字标题 8 字以内\n" +
              "- 高光：从第 0 秒开始，节奏快\n" +
              "- 输出：cover.png + clip.mp4",
          },
        ],
      },
      {
        title: "知识库问答（文件驱动）",
        desc: "把合同/素材/产品资料存进知识库，用问题驱动检索下一步该看什么。",
        icon: <HardDrive className="h-4 w-4 text-sky-600" />,
        actions: [
          {
            type: "open_app",
            appId: "knowledge_vault",
            label: "打开 知识库",
          },
          {
            type: "copy",
            label: "复制提问模板",
            text:
              "我想要达成的目标：<例如：写一篇公众号深度文/做一套销售话术>\n" +
              "当前资料包含：<例如：产品参数/历史合同/用户反馈>\n" +
              "请告诉我：最相关的 3 份资料 + 我还缺什么关键信息 + 下一步怎么做。",
          },
        ],
      },
      {
        title: "内容选题与标题库（可复用资产）",
        desc: "把高转化标题、开头、评论区常见问题沉淀为可复用组件。",
        icon: <FileText className="h-4 w-4 text-amber-600" />,
        actions: [
          { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
          { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
        ],
      },
      {
        title: "评论区/私信回复（半自动）",
        desc: "把高频提问做成标准回复 + 引导话术；先用 Spotlight 跑通，再接入 webhook 自动化。",
        icon: <Rocket className="h-4 w-4 text-rose-600" />,
        actions: [
          {
            type: "copy",
            label: "复制 Spotlight 指令",
            text:
              "（Spotlight）请把下面问题生成 3 条不同语气的标准回复，并给出一句引导私信/关注的 CTA：\n" +
              "问题：<在这里填用户提问>",
          },
          { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
        ],
      },
    ],
    [],
  );

  const runAction = useCallback(
    (action: PlaybookAction) => {
      if (action.type === "open_app") requestOpenApp(action.appId);
      if (action.type === "copy") copy(action.text);
    },
    [copy],
  );

  const saveBuiltinToMine = useCallback(
    (p: BuiltinPlaybook) => {
      const created = createPlaybook({
        title: p.title,
        desc: p.desc,
        actions: p.actions,
      });
      if (!created) {
        showToast("保存失败：标题为空");
        return;
      }
      refreshPlaybooks();
      showToast("已保存到“我的 Playbooks”");
    },
    [refreshPlaybooks, showToast],
  );

  return (
    <AppWindowShell
      state={state}
      zIndex={zIndex}
      active={active}
      title="Ops · Workflow Playbooks"
      icon={BriefcaseBusiness}
      widthClassName="w-[1100px]"
      storageKey="openclaw.window.solo_ops"
      onFocus={onFocus}
      onMinimize={onMinimize}
      onClose={onClose}
    >
      <div className="bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">
                Workflow Playbooks（MVP）
              </div>
              <div className="text-sm text-gray-500 mt-1">
                目标：用最少的步骤，把选题→内容→分发→复盘跑成“可复用系统”。
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => requestOpenApp("media_ops")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors"
              >
                <Rocket className="h-4 w-4" />
                开始产出
              </button>
              <button
                type="button"
                onClick={() => requestOpenApp("publisher")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                去发布
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {toast && (
              <div className="sticky top-0 z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow">
                  {toast}
                </div>
              </div>
            )}

            {steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{s.desc}</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600/80" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {s.apps.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => requestOpenApp(a.id)}
                      className="px-3 py-2 rounded-xl bg-gray-50 text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      打开 {a.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">成熟应用场景（可直接套用）</div>
              <div className="mt-1 text-sm text-gray-600">
                这些是当前 WebOS 已经能跑起来的“组合拳”（先手动跑通，再接 webhook 实现自动发布）。
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {builtInPlaybooks.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-8 w-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            {p.icon}
                          </span>
                          <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">{p.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => saveBuiltinToMine(p)}
                        className="shrink-0 px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        保存
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {p.actions.map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => runAction(a)}
                          className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900">我的 Playbooks</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copy(JSON.stringify(myPlaybooks, null, 2))}
                    className="px-3 py-2 rounded-xl bg-gray-50 text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    导出全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportOpen((v) => !v)}
                    className="px-3 py-2 rounded-xl bg-gray-50 text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    导入
                  </button>
                </div>
              </div>

              {importOpen && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="粘贴 Playbook JSON（单个对象或数组）"
                    className="w-full h-28 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setImportOpen(false);
                        setImportText("");
                      }}
                      className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const res = importPlaybooksFromText(importText.trim());
                        if (!res.ok) {
                          showToast(`导入失败：${res.error}`);
                          return;
                        }
                        refreshPlaybooks();
                        showToast(`已导入 ${res.imported} 个 Playbook`);
                        setImportOpen(false);
                        setImportText("");
                      }}
                      className="px-3 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-black transition-colors"
                    >
                      导入
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 space-y-3">
                {myPlaybooks.length === 0 ? (
                  <div className="text-xs text-gray-500">
                    还没有 Playbook。你可以在左侧的“成熟应用场景”里点「保存」。
                  </div>
                ) : (
                  myPlaybooks.slice(0, 6).map((p) => (
                    <div key={p.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{p.title}</div>
                          <div className="mt-1 text-xs text-gray-600 line-clamp-2">{p.desc}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => copy(JSON.stringify(p, null, 2))}
                            className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            导出
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deletePlaybook(p.id);
                              refreshPlaybooks();
                              showToast("已删除");
                            }}
                            className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      {p.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {p.actions.slice(0, 4).map((a) => (
                            <button
                              key={`${p.id}:${a.label}`}
                              type="button"
                              onClick={() => runAction(a)}
                              className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              {a.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Compass className="h-4 w-4 text-indigo-600" />
                今日 30 分钟 SOP
              </div>
              <ol className="mt-3 space-y-2 text-sm text-gray-600 list-decimal pl-5">
                <li>选 1 个选题：目标用户 + 痛点 + 一句话卖点</li>
                <li>在「AI 文案」生成 2 套版本，保存到内容库</li>
                <li>在「AI 视觉工坊」出封面/剪辑关键画面</li>
                <li>在「矩阵发布中心」选择平台并预演发布</li>
                <li>在「知识库」记录：有效标题/开头/评论区问题</li>
              </ol>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900">建议的自动化路线</div>
              <div className="mt-2 text-sm text-gray-600">
                1) 先做“发布预演”（可复制粘贴）→ 2) 接入平台授权 → 3) 服务端队列 +
                回调 → 4) 指标回流与 A/B 测试。
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppWindowShell>
  );
}
