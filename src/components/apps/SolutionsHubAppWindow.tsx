"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Copy, Layers, Plus, ShieldCheck } from "lucide-react";

import type { AppWindowProps } from "@/apps/types";
import { AppWindowShell } from "@/components/windows/AppWindowShell";
import { createPlaybook, loadPlaybooks, type PlaybookAction } from "@/lib/playbooks";
import { requestOpenApp } from "@/lib/ui-events";

type Solution = {
  id: string;
  category: string;
  tags: string[];
  title: string;
  desc: string;
  stacks: Array<{ title: string; items: string[] }>;
  playbooks: Array<{ title: string; desc: string; actions: PlaybookAction[] }>;
  setupChecklist: string;
};

function buildSolutions(): Solution[] {
  return [
    {
      id: "content-pipeline",
      category: "内容增长",
      tags: ["内容", "分发", "复盘", "模板"],
      title: "内容生产流水线（从选题到复盘）",
      desc: "把“选题→脚本/文案→素材→发布→复盘”固化成可重复的 SOP，并用 Playbooks 管理。",
      stacks: [
        { title: "内容资产", items: ["知识库（素材/FAQ/品牌口径）", "模板库（标题/开头/CTA）", "版本管理（草稿与发布记录）"] },
        { title: "生产工具（示例）", items: ["文案生成：LLM + 提示词模板", "视觉素材：设计/剪辑工具", "协作：文档/看板"] },
        { title: "分发与排程", items: ["发布预演（本项目内置）", "连接器：官方 API 或合规第三方排程工具", "发布回执（webhook receipts）"] },
      ],
      playbooks: [
        {
          title: "内容包：一稿多发（4 平台）",
          desc: "一份选题产出多平台版本 + 话题标签 + CTA。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            { type: "open_app", appId: "publisher", label: "打开 矩阵发布中心" },
            {
              type: "copy",
              label: "复制提示词模板",
              text:
                "请把以下选题做成多平台内容包：\n" +
                "1) 小红书：标题 3 个 + 正文 + 话题标签\n" +
                "2) 抖音：口播脚本 + 字幕要点 + 结尾 CTA\n" +
                "3) Instagram：短文 + hashtag\n" +
                "4) TikTok：强钩子 + 快节奏脚本\n" +
                "选题：<填写主题>\n" +
                "目标用户：<填写>\n" +
                "约束：避免夸大；可直接发布。",
            },
          ],
        },
        {
          title: "复盘：把有效素材沉淀成模板",
          desc: "把有效标题/开头/评论区问题沉淀为可复用资产。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
            {
              type: "copy",
              label: "复制复盘模板",
              text:
                "复盘记录：\n" +
                "- 目标：<转化/涨粉/引流>\n" +
                "- 发布平台：<平台>\n" +
                "- 有效点：标题/开头/结构/CTA/评论区问题\n" +
                "- 可复用模板：<标题公式/开头句式/回复模板>\n" +
                "- 下一轮实验：<A/B 变量与预期>",
            },
          ],
        },
      ],
      setupChecklist:
        "内容流水线搭建清单：\n" +
        "1) 在「设置」配置大模型 Provider（Key/Base URL/Model）。\n" +
        "2) 在「知识库」建立：品牌口径/FAQ/素材库/标题库。\n" +
        "3) 在「矩阵发布中心」先用“安全预演”跑通流程。\n" +
        "4) 如需自动发布：用 webhook 连接器对接官方 API 或合规第三方工具。\n" +
        "5) 每周固定复盘，把有效内容沉淀为模板与 Playbooks。",
    },
    {
      id: "customer-support",
      category: "用户运营",
      tags: ["客服", "私信", "评论", "SOP"],
      title: "评论区 / 私信 / 工单（标准回复 + 跟进）",
      desc: "把高频问题做成回复模板，并把需要跟进的对话自动变成任务/草稿。",
      stacks: [
        { title: "标准化", items: ["高频问题库（知识库）", "回复模板（多语气/多场景）", "合规口径（避免夸大承诺）"] },
        { title: "流转", items: ["统一入口（连接器：表单/邮箱/客服系统）", "自动建任务（webhook → task）", "人工审核后再发布/回复"] },
      ],
      playbooks: [
        {
          title: "标准回复：同问题 3 种语气",
          desc: "生成标准回复 + 1 句引导 CTA（关注/私信/下单）。",
          actions: [
            {
              type: "copy",
              label: "复制 Spotlight 指令",
              text:
                "> 请把下面问题生成 3 条不同语气的标准回复，并给出一句引导 CTA：\n" +
                "问题：<粘贴用户问题>\n" +
                "限制：避免夸大；尽量短；可直接发送。",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
      ],
      setupChecklist:
        "客服/跟进清单：\n" +
        "1) 在「知识库」建立 FAQ 与标准口径。\n" +
        "2) 把常见问题做成 Playbooks（回复模板）。\n" +
        "3) 用连接器把评论/私信/表单汇总到 webhook，再由人工审核后处理。\n" +
        "4) 需要长期跟进的对话转成任务并设定 SLA。",
    },
    {
      id: "launch-checklist",
      category: "发布上线",
      tags: ["发布", "清单", "复用"],
      title: "产品/活动发布（从准备到上线）",
      desc: "用“可复用清单 + 内容包 + 回执”把每次发布变成可复制的动作。",
      stacks: [
        { title: "准备", items: ["定位/卖点/FAQ（知识库）", "素材与落地页（资产管理）", "发布节奏（看板/日历）"] },
        { title: "上线", items: ["多平台内容包（文案/素材/脚本）", "发布队列与回执（Publisher）", "指标与反馈回流（后续接入）"] },
      ],
      playbooks: [
        {
          title: "发布清单：上线前 30 分钟",
          desc: "快速检查素材、口径、链接、风险点。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            { type: "open_app", appId: "publisher", label: "打开 矩阵发布中心" },
            {
              type: "copy",
              label: "复制检查清单",
              text:
                "上线前检查：\n" +
                "- 链接/二维码是否正确\n" +
                "- 标题/主卖点/价格口径一致\n" +
                "- 关键素材（封面/视频/图）齐全\n" +
                "- 风险词/夸大承诺已移除\n" +
                "- 评论区常见问题的标准回复已准备",
            },
          ],
        },
      ],
      setupChecklist:
        "发布流程清单：\n" +
        "1) 在「任务调度」建立发布里程碑与负责人（可个人）。\n" +
        "2) 在「AI 文案/视觉工坊」生成内容包与素材。\n" +
        "3) 在「发布中心」先 dry-run 预演，再决定是否 dispatch。\n" +
        "4) 通过连接器写入回执（id/url/时间）用于复盘。",
    },
    {
      id: "ecommerce-ops",
      category: "电商运营",
      tags: ["上新", "促销", "商品", "素材"],
      title: "电商上新与促销（素材包 + 发布节奏）",
      desc: "上新/大促时快速生成“商品卖点 + 素材清单 + 多平台文案”，并固化成复用模板。",
      stacks: [
        { title: "商品资产", items: ["卖点/参数/FAQ（知识库）", "图片/视频素材（视觉工坊）", "价格与活动口径（统一模板）"] },
        { title: "节奏与执行", items: ["任务看板（上新前 7 天）", "多平台内容包（文案/脚本）", "发布中心：预演/队列/回执"] },
      ],
      playbooks: [
        {
          title: "上新内容包：卖点 → 多平台文案",
          desc: "从商品信息生成：标题/主图文案/短视频脚本/FAQ。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制商品信息模板",
              text:
                "请基于以下商品信息，生成上新内容包：\n" +
                "- 核心卖点（3 条）\n" +
                "- 小红书：标题 3 个 + 正文 + 话题\n" +
                "- 抖音：口播脚本（15-25 秒）+ 字幕要点\n" +
                "- Instagram/TikTok：短文/脚本 + hashtag\n" +
                "- FAQ：10 个常见问题 + 标准回复\n" +
                "商品信息：<参数/材质/规格/价格/优惠>\n" +
                "目标人群：<填写>\n" +
                "限制：避免夸大；不使用绝对化用语。",
            },
          ],
        },
        {
          title: "大促清单：上线前 24 小时",
          desc: "检查库存、口径、素材、链接与风险点。",
          actions: [
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
            {
              type: "copy",
              label: "复制大促检查清单",
              text:
                "大促上线前 24 小时检查：\n" +
                "- 活动规则与价格口径一致\n" +
                "- 库存/发货时效明确\n" +
                "- 主图/视频/封面齐全并过审\n" +
                "- 站内链接/落地页/客服入口可用\n" +
                "- 评论区高频问题标准回复就绪\n" +
                "- 风险词/夸大承诺已移除",
            },
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
          ],
        },
      ],
      setupChecklist:
        "电商上新/大促搭建清单：\n" +
        "1) 在「知识库」建立商品资料卡模板（参数/卖点/FAQ）。\n" +
        "2) 在「任务调度」建立上新节奏（T-7/T-3/T-1）。\n" +
        "3) 在「发布中心」先预演，确认排版与话题；再接 webhook 排程。\n" +
        "4) 复盘：把高转化标题/开头沉淀为模板。",
    },
    {
      id: "lead-gen-funnel",
      category: "增长获客",
      tags: ["线索", "漏斗", "表单", "转化"],
      title: "线索获取漏斗（内容 → 表单 → 跟进）",
      desc: "用内容引流到表单/私信入口，把线索自动变任务，并沉淀跟进脚本。",
      stacks: [
        { title: "入口", items: ["内容引流（多平台）", "表单/落地页（外部工具）", "自动建任务（webhook → task）"] },
        { title: "跟进", items: ["跟进脚本库（知识库）", "SLA 与提醒（任务调度）", "转化反馈与迭代（复盘模板）"] },
      ],
      playbooks: [
        {
          title: "引流文案：强钩子 + 表单 CTA",
          desc: "生成 3 个不同角度的引流文案，并带明确 CTA。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制引流提示词",
              text:
                "请生成引流内容（3 个角度）：\n" +
                "- 每个角度：标题 + 开头 2 句 + 正文 120-200 字 + CTA（填写表单/私信关键词）\n" +
                "目标人群：<填写>\n" +
                "价值承诺：<填写>\n" +
                "表单/私信入口：<链接或关键词>\n" +
                "限制：避免夸大；不承诺不可控结果。",
            },
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
          ],
        },
        {
          title: "线索跟进：首次触达脚本（3 版本）",
          desc: "三种语气：专业/轻松/直给；带问题引导。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            {
              type: "copy",
              label: "复制跟进脚本模板",
              text:
                "请根据以下线索信息，写首次触达脚本（3 个版本）：\n" +
                "- 开场（表明来意）\n" +
                "- 3 个澄清问题（快速判断匹配度）\n" +
                "- 下一步建议（预约/试用/发资料）\n" +
                "线索来源：<平台/表单>\n" +
                "线索需求：<粘贴>\n" +
                "限制：不强推；尊重隐私。",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
      ],
      setupChecklist:
        "线索漏斗搭建清单：\n" +
        "1) 准备表单/落地页（外部工具），并定义字段（需求/预算/时间）。\n" +
        "2) 用连接器把表单提交推送到 webhook，并自动创建任务。\n" +
        "3) 在「知识库」沉淀：跟进脚本/常见异议处理。\n" +
        "4) 每周复盘：来源渠道 → 成交率 → 内容迭代。",
    },
    {
      id: "newsletter-system",
      category: "内容增长",
      tags: ["newsletter", "周报", "复用", "自动化"],
      title: "Newsletter / 周报系统（收集 → 写作 → 分发）",
      desc: "把一周的素材收集起来，自动整理成周报/Newsletter，并拆成短内容分发。",
      stacks: [
        { title: "收集", items: ["灵感/链接/素材（知识库）", "每周固定收集任务（任务调度）"] },
        { title: "写作与拆条", items: ["长文结构（模板）", "拆条成多平台短内容", "发布中心：预演与回执"] },
      ],
      playbooks: [
        {
          title: "周报大纲：3 栏目固定结构",
          desc: "把素材整理成：洞察/案例/行动建议。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制周报模板",
              text:
                "请把下面素材整理成一篇周报（800-1200 字）：\n" +
                "栏目 1：本周洞察（3 条）\n" +
                "栏目 2：案例拆解（1 条）\n" +
                "栏目 3：下周行动建议（5 条）\n" +
                "素材：<粘贴本周收集内容>\n" +
                "语气：清晰、克制、不夸大。",
            },
          ],
        },
        {
          title: "长文拆条：一稿多用（7 条）",
          desc: "把周报拆成 7 条短内容，适配不同平台。",
          actions: [
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
            {
              type: "copy",
              label: "复制拆条提示词",
              text:
                "请把下面长文拆成 7 条短内容：\n" +
                "- 每条：标题 + 3-6 句正文 + 话题/hashtag（可选）\n" +
                "- 保持信息一致，不新增不确定事实\n" +
                "长文：<粘贴周报正文>",
            },
          ],
        },
      ],
      setupChecklist:
        "周报系统搭建清单：\n" +
        "1) 在「任务调度」创建每周固定任务：收集素材/写作/拆条/发布。\n" +
        "2) 在「知识库」建立收集模板（来源/要点/可引用句）。\n" +
        "3) 发布时先 dry-run 预演，再接入 webhook 排程。\n" +
        "4) 复盘：打开率/互动 → 优化栏目与标题。",
    },
    {
      id: "brand-kit",
      category: "品牌与资产",
      tags: ["品牌", "一致性", "素材", "规范"],
      title: "品牌素材与一致性（Brand Kit）",
      desc: "把品牌口径、视觉风格、禁用词、常用模板沉淀成一套“可复用资产”。",
      stacks: [
        { title: "规范", items: ["品牌语气/禁用词/免责声明（知识库）", "标题/CTA 模板", "视觉风格（色彩/字体/封面结构）"] },
        { title: "生产", items: ["文案：按模板生成", "视觉：按 Brand Kit 输出", "发布：预演检查一致性"] },
      ],
      playbooks: [
        {
          title: "Brand Kit：口径与禁用词清单",
          desc: "生成品牌口径文档骨架，便于后续补全。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            {
              type: "copy",
              label: "复制 Brand Kit 模板",
              text:
                "请输出 Brand Kit 文档骨架：\n" +
                "1) 品牌一句话定位\n" +
                "2) 语气（Do/Don't）\n" +
                "3) 禁用词/风险词（以及替代说法）\n" +
                "4) 免责声明模板（按场景）\n" +
                "5) 标题/开头/CTA 模板库（各 10 条）\n" +
                "6) 常见问答标准口径（10 条）",
            },
          ],
        },
        {
          title: "发布前一致性检查",
          desc: "发布前检查是否符合 Brand Kit 与合规口径。",
          actions: [
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
            {
              type: "copy",
              label: "复制检查项",
              text:
                "一致性检查：\n" +
                "- 是否使用了禁用词/绝对化表述\n" +
                "- 标题/卖点与正文一致\n" +
                "- 视觉风格是否符合 Brand Kit\n" +
                "- CTA 是否清晰且不误导\n" +
                "- 如涉及效果承诺，是否加入必要免责声明",
            },
          ],
        },
      ],
      setupChecklist:
        "Brand Kit 搭建清单：\n" +
        "1) 在「知识库」建立 Brand Kit（口径/禁用词/模板）。\n" +
        "2) 在「视觉工坊」沉淀封面结构与风格参考。\n" +
        "3) 在「发布中心」把一致性检查固化为发布前必做步骤。",
    },
    {
      id: "ops-dashboard",
      category: "运营管理",
      tags: ["仪表盘", "复盘", "节奏", "效率"],
      title: "日常运营节奏（每日清单 + 周复盘）",
      desc: "建立每日 30 分钟例行 SOP + 每周复盘仪表盘，持续优化产出与分发。",
      stacks: [
        { title: "日常节奏", items: ["今日清单（固定 5 步）", "内容/客服/跟进 3 个 Inbox", "发布队列与回执"] },
        { title: "周复盘", items: ["本周产出/发布次数", "有效模板与失败原因", "下周实验计划（A/B）"] },
      ],
      playbooks: [
        {
          title: "每日 30 分钟 Ops",
          desc: "固定 5 步快速推进：收集→生产→发布→跟进→沉淀。",
          actions: [
            { type: "open_app", appId: "solo_ops", label: "打开 Workflow Playbooks" },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
            {
              type: "copy",
              label: "复制每日清单",
              text:
                "每日 30 分钟：\n" +
                "1) 收集：新增 3 条素材到知识库\n" +
                "2) 生产：生成 1 份内容包（或补齐素材）\n" +
                "3) 发布：预演/排程 1-2 条\n" +
                "4) 跟进：处理 5 条评论/私信/线索\n" +
                "5) 沉淀：记录 1 条可复用模板/洞察",
            },
          ],
        },
        {
          title: "周复盘：有效模板与下周实验",
          desc: "把结果回流到模板库与实验计划。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            {
              type: "copy",
              label: "复制周复盘模板",
              text:
                "周复盘：\n" +
                "- 本周产出：<数量>\n" +
                "- 本周发布：<数量>\n" +
                "- 有效模板：<标题/开头/结构/CTA>\n" +
                "- 失败原因：<分发/素材/定位/执行>\n" +
                "- 下周实验（A/B）：<变量、样本、预期>\n" +
                "- 需要补的资产：<素材/FAQ/口径>",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
      ],
      setupChecklist:
        "日常运营节奏搭建清单：\n" +
        "1) 固定每日 30 分钟 SOP（写入 Playbooks）。\n" +
        "2) 固定每周复盘（模板化），并把有效内容沉淀。\n" +
        "3) 将关键任务设置提醒与优先级，避免被碎片化打断。",
    },
    {
      id: "saas-growth",
      category: "SaaS 增长",
      tags: ["增长", "试用", "激活", "留存"],
      title: "SaaS 增长闭环（获客 → 激活 → 留存）",
      desc: "把内容获客、试用引导、功能教育与留存触达做成一套可复用 SOP，并用连接器回流指标。",
      stacks: [
        { title: "获客", items: ["内容矩阵（多平台）", "落地页/表单（外部工具）", "线索进入任务队列（webhook）"] },
        { title: "激活", items: ["新手引导/Onboarding 文案", "教育内容（教程/案例）", "关键动作清单（任务调度）"] },
        { title: "留存", items: ["周报/产品更新（Newsletter）", "用户触达（合规工具/官方 API）", "指标回流与复盘（后续接入）"] },
      ],
      playbooks: [
        {
          title: "激活邮件/站内引导：3 段式",
          desc: "欢迎 → 关键动作 → 下一步 CTA（预约/试用/教程）。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制激活模板",
              text:
                "请写 SaaS 试用激活引导（3 个版本，语气不同）：\n" +
                "- 目标：让用户完成关键动作（Activation）\n" +
                "- 结构：欢迎 + 价值一句话 + 关键动作步骤（3 步）+ CTA\n" +
                "产品：<一句话介绍>\n" +
                "目标用户：<填写>\n" +
                "关键动作：<例如：创建第一个项目/导入数据>\n" +
                "限制：短、清晰、不夸大。",
            },
          ],
        },
        {
          title: "新功能发布：一稿多用（公告 + 短内容）",
          desc: "把更新说明拆成公告与多平台短内容。",
          actions: [
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
            {
              type: "copy",
              label: "复制发布提示词",
              text:
                "请基于以下更新内容输出：\n" +
                "1) 更新公告（300-500 字）\n" +
                "2) 多平台短内容（5 条）：每条标题 + 3-5 句正文 + CTA\n" +
                "更新内容：<粘贴 changelog/功能说明>\n" +
                "用户收益：<填写>\n" +
                "限制：不承诺不可控结果；避免夸大。",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
      ],
      setupChecklist:
        "SaaS 增长闭环搭建清单：\n" +
        "1) 定义关键动作（Activation）与指标口径。\n" +
        "2) 用 Playbooks 固化：获客内容、激活引导、留存触达。\n" +
        "3) 用连接器：表单/CRM 线索进入任务；合规触达工具发送消息；回执写入发布记录。\n" +
        "4) 每周复盘：渠道 → 激活 → 留存，迭代模板与节奏。",
    },
    {
      id: "info-product",
      category: "知识产品",
      tags: ["课程", "转化", "交付", "社群"],
      title: "课程/知识产品（内容引流 → 转化 → 交付）",
      desc: "把引流内容、销售页要点、成交后交付与社群运营做成可复用 SOP。",
      stacks: [
        { title: "引流", items: ["选题与栏目（周更）", "多平台内容包", "线索入口（表单/私信关键词）"] },
        { title: "转化", items: ["销售页要点/FAQ（知识库）", "异议处理话术（模板）", "人工审核后再触达"] },
        { title: "交付", items: ["交付清单（任务调度）", "课程内容拆分与更新", "复盘：满意度与续费"] },
      ],
      playbooks: [
        {
          title: "课程引流：3 选题 + 7 天内容排期",
          desc: "快速生成一周排期，并给出每条内容的结构。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制排期提示词",
              text:
                "请为一个课程/知识产品生成：\n" +
                "1) 选题方向 3 个（每个方向给 5 个子选题）\n" +
                "2) 7 天内容排期（每天 1 条）：标题 + 大纲 + CTA（私信关键词/表单）\n" +
                "课程主题：<填写>\n" +
                "目标人群：<填写>\n" +
                "限制：避免夸大；给出可执行步骤。",
            },
            { type: "open_app", appId: "publisher", label: "打开 发布中心" },
          ],
        },
        {
          title: "异议处理：标准话术库（10 条）",
          desc: "价格/时间/效果/信任等常见异议的回复模板。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            {
              type: "copy",
              label: "复制话术提示词",
              text:
                "请生成课程销售的异议处理话术库（10 条），覆盖：\n" +
                "- 价格贵/没时间/担心学不会/效果不确定/怕被骗/已经买过类似\n" +
                "每条给：共情一句 + 解释 + 1 个小承诺（可控）+ 下一步 CTA（预约/试学/发资料）。\n" +
                "课程信息：<一句话卖点 + 交付形式>\n" +
                "限制：不做不可控承诺；避免夸大。",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
      ],
      setupChecklist:
        "课程/知识产品搭建清单：\n" +
        "1) 在「知识库」沉淀：课程大纲、FAQ、案例、异议处理话术。\n" +
        "2) 用 Playbooks 固化：选题排期、引流 CTA、成交后交付清单。\n" +
        "3) 用连接器：表单线索 → 创建任务；成交回执 → 写入交付队列。\n" +
        "4) 每周复盘：引流 → 转化 → 完课/满意度。",
    },
    {
      id: "b2b-outreach",
      category: "B2B 外联",
      tags: ["外联", "邮件", "LinkedIn", "线索"],
      title: "B2B 外联系统（名单 → 触达 → 跟进）",
      desc: "把目标名单、触达脚本与跟进节奏做成可复用系统（不包含任何平台绕过自动化）。",
      stacks: [
        { title: "名单", items: ["目标画像（ICP）", "名单来源（外部：CRM/表格）", "去重与备注（外部或后续接入）"] },
        { title: "触达", items: ["首封/二封/三封脚本", "个性化要点提取（可选）", "合规发送（官方 API / 合规工具）"] },
        { title: "跟进", items: ["任务化跟进（提醒/SLA）", "异议处理与案例库（知识库）", "回执与复盘（响应率/预约率）"] },
      ],
      playbooks: [
        {
          title: "外联邮件：3 封序列（冷启动）",
          desc: "首封 + 跟进 1 + 跟进 2，适配不同语气。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制外联模板",
              text:
                "请为 B2B 外联写 3 封邮件序列：\n" +
                "1) 首封：一句话价值 + 2 个要点 + 1 个低门槛 CTA（15 分钟）\n" +
                "2) 跟进 1：补充一个案例/数据点（不夸大）\n" +
                "3) 跟进 2：给一个替代选择（资料包/异步）\n" +
                "目标客户画像（ICP）：<行业/规模/角色>\n" +
                "我们提供的价值：<一句话>\n" +
                "限制：不夸大；礼貌；可复制发送。",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
        {
          title: "跟进节奏：7 天任务化",
          desc: "把外联变成任务队列，避免遗漏。",
          actions: [
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
            {
              type: "copy",
              label: "复制 7 天节奏",
              text:
                "B2B 外联 7 天节奏：\n" +
                "Day 1：首封 + 记录备注\n" +
                "Day 3：跟进 1\n" +
                "Day 5：跟进 2\n" +
                "Day 7：收尾（是否关闭/转入长期培育）\n" +
                "每次记录：响应/下一步/风险点。",
            },
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
          ],
        },
      ],
      setupChecklist:
        "B2B 外联搭建清单：\n" +
        "1) 定义 ICP 与不做触达的边界（合规）。\n" +
        "2) 把脚本、案例、异议处理沉淀到「知识库」。\n" +
        "3) 用连接器（合规工具/官方 API）发送与记录回执；或先手动执行。\n" +
        "4) 用「任务调度」管理 7 天跟进节奏并复盘响应率。",
    },
    {
      id: "hiring-delivery",
      category: "招聘与交付",
      tags: ["招聘", "面试", "交付", "外包"],
      title: "招聘/外包交付（需求 → 筛选 → 交付验收）",
      desc: "把招聘/外包从需求拆解到验收标准固化，减少沟通成本与返工。",
      stacks: [
        { title: "需求", items: ["岗位/外包需求卡（范围/产出/验收）", "时间线与风险（任务调度）"] },
        { title: "筛选", items: ["简历/作品筛选标准", "面试题库与评分表", "Offer/合同要点（外部或后续接入）"] },
        { title: "交付", items: ["里程碑与回传机制（webhook receipts）", "验收清单与缺陷闭环", "复盘：供应商/候选人表现"] },
      ],
      playbooks: [
        {
          title: "需求卡：范围 + 验收标准",
          desc: "把模糊需求变成可交付、可验收的清单。",
          actions: [
            { type: "open_app", appId: "knowledge_vault", label: "打开 知识库" },
            {
              type: "copy",
              label: "复制需求卡模板",
              text:
                "请把下面需求整理成“可验收”的需求卡：\n" +
                "- 背景/目标\n" +
                "- 范围（做/不做）\n" +
                "- 交付物清单（文件/代码/文档）\n" +
                "- 验收标准（可测量）\n" +
                "- 时间线与里程碑\n" +
                "- 风险与依赖\n" +
                "原始需求：<粘贴>",
            },
            { type: "open_app", appId: "task_manager", label: "打开 任务调度" },
          ],
        },
        {
          title: "面试题库：按岗位生成 + 评分表",
          desc: "生成结构化面试题与评分维度。",
          actions: [
            { type: "open_app", appId: "media_ops", label: "打开 AI 文案" },
            {
              type: "copy",
              label: "复制面试模板",
              text:
                "请为以下岗位生成结构化面试包：\n" +
                "1) 核心能力维度（5-7 个）\n" +
                "2) 每个维度 2 个问题（含追问）\n" +
                "3) 评分表（1-5 分）与红旗信号\n" +
                "岗位：<填写>\n" +
                "级别：<初/中/高>\n" +
                "工作内容：<粘贴 JD 或要点>",
            },
          ],
        },
      ],
      setupChecklist:
        "招聘/外包交付搭建清单：\n" +
        "1) 用需求卡固化范围与验收标准（写入知识库）。\n" +
        "2) 用任务调度管理筛选/面试/里程碑交付。\n" +
        "3) 用连接器把回执（交付物链接/状态）写入发布/交付记录（后续可扩展）。\n" +
        "4) 复盘：质量/沟通/时效，沉淀供应商/候选人评估模板。",
    },
  ];
}

export function SolutionsHubAppWindow({
  state,
  zIndex,
  active,
  onFocus,
  onMinimize,
  onClose,
}: AppWindowProps) {
  const isVisible = state === "open" || state === "opening";
  const solutions = useMemo(() => buildSolutions(), []);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(solutions[0]?.id ?? "content-pipeline");
  const [installedCount, setInstalledCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setInstalledCount(loadPlaybooks().length);
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.startsWith("openclaw.playbooks")) setInstalledCount(loadPlaybooks().length);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isVisible]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1600);
  }, []);

  const selected = useMemo(
    () => solutions.find((s) => s.id === selectedId) ?? solutions[0],
    [selectedId, solutions],
  );

  const filteredSolutions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return solutions;
    return solutions.filter((s) => {
      const hay = `${s.title} ${s.desc} ${s.category} ${s.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, solutions]);

  useEffect(() => {
    if (!filteredSolutions.some((s) => s.id === selectedId)) {
      setSelectedId(filteredSolutions[0]?.id ?? solutions[0]?.id ?? selectedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSolutions]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败（浏览器权限）");
    }
  }, [showToast]);

  const installSelected = useCallback(() => {
    if (!selected) return;
    const before = loadPlaybooks().length;
    for (const pb of selected.playbooks) {
      createPlaybook({ title: pb.title, desc: pb.desc, actions: pb.actions });
    }
    const after = loadPlaybooks().length;
    showToast(after > before ? "已安装到“我的 Playbooks”" : "已存在或安装失败");
    setInstalledCount(after);
  }, [selected, showToast]);

  return (
    <AppWindowShell
      state={state}
      zIndex={zIndex}
      active={active}
      title="Solutions Hub"
      icon={Layers}
      widthClassName="w-[1180px]"
      storageKey="openclaw.window.solutions_hub"
      onFocus={onFocus}
      onMinimize={onMinimize}
      onClose={onClose}
    >
      <div className="bg-white">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-bold text-gray-900">成熟落地方案库</div>
              <div className="text-sm text-gray-500 mt-1">
                用“方案 → Playbooks → 连接器”把真实业务流程快速装进 WebOS。
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold">
                  <ShieldCheck className="h-4 w-4" />
                  合规优先：官方 API / 合规工具 / webhook 连接器
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  本地优先：Playbooks 存在浏览器 localStorage
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => requestOpenApp("solo_ops")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                打开 Playbooks
              </button>
              <button
                type="button"
                onClick={installSelected}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                安装当前方案
              </button>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            已安装 Playbooks：<span className="font-semibold text-gray-800">{installedCount}</span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <aside className="lg:col-span-1 space-y-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索方案（关键词/标签）…"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <div className="mt-2 text-[11px] text-gray-500">
                共 {solutions.length} 个 · 当前 {filteredSolutions.length} 个
              </div>
            </div>

            {filteredSolutions.map((s) => {
              const isActive = s.id === selectedId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedId(s.id)}
                  className={[
                    "w-full text-left rounded-2xl border p-4 transition-colors",
                    isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  <div className={["text-sm font-semibold", isActive ? "text-white" : "text-gray-900"].join(" ")}>
                    {s.title}
                  </div>
                  <div className={["mt-1 text-xs", isActive ? "text-white/75" : "text-gray-500"].join(" ")}>
                    {s.desc}
                  </div>
                  <div className={["mt-2 flex flex-wrap items-center gap-1.5", isActive ? "text-white/70" : "text-gray-500"].join(" ")}>
                    <span className={["text-[10px] px-2 py-0.5 rounded-full border font-semibold", isActive ? "border-white/20 bg-white/10" : "border-gray-200 bg-gray-50"].join(" ")}>
                      {s.category}
                    </span>
                    {s.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className={["text-[10px] px-2 py-0.5 rounded-full border font-semibold", isActive ? "border-white/15 bg-white/5" : "border-gray-200 bg-white"].join(" ")}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </aside>

          <main className="lg:col-span-3 space-y-4">
            {toast && (
              <div className="sticky top-0 z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold shadow">
                  {toast}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="text-sm font-semibold text-gray-900">方案结构</div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.stacks.map((b) => (
                  <div key={b.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
                      {b.items.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Playbooks（可直接安装）</div>
                  <div className="mt-1 text-xs text-gray-500">
                    点击「安装当前方案」会把这些 Playbooks 写入“我的 Playbooks”。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(JSON.stringify(selected.playbooks, null, 2))}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  复制 Playbooks JSON
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {selected.playbooks.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">{p.title}</div>
                    <div className="mt-1 text-sm text-gray-600">{p.desc}</div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {p.actions.map((a) => (
                        <button
                          key={a.label}
                          type="button"
                          onClick={() => {
                            if (a.type === "open_app") requestOpenApp(a.appId);
                            if (a.type === "copy") void copy(a.text);
                          }}
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

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">搭建清单</div>
                  <div className="mt-1 text-xs text-gray-500">
                    用于把外部工具/连接器“接入”到本 UI（不包含任何平台绕过自动化）。
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copy(selected.setupChecklist)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-black transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  复制清单
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-gray-700 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {selected.setupChecklist}
              </pre>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => requestOpenApp("settings")}
                  className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  打开 设置
                </button>
                <button
                  type="button"
                  onClick={() => requestOpenApp("publisher")}
                  className="px-3 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  打开 发布中心
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppWindowShell>
  );
}
