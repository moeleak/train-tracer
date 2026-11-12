export type Status = "done" | "training" | "pending" | "stopped" | "failed" | "not-trained"

export type Planner = {
  name: string
  code: string
  baseline: string
  variable: string
  addedRows: number | null
  totalRows: number | null
  seed: number
  steps: number | null
  hardware: string
  aw116: number | null
  dev209: number | null
  status: Status
  note?: string
}

export const updatedAt = "2026-11-12"

export const fixedRecipe = [
  "每次从同一底座和 adapter 从头训练，不接着上一个模型训",
  "全参数 CE，学习率 2e-6，视觉学习率 2e-7，warmup 3%",
  "全局 batch 16，2 个 epoch，取 epoch-02",
  "基础数据 27,228 行：OpenMobile 14,167 行 + AW 教师轨迹 13,061 行",
  "评测：原生扩散解码，块长 16，每块 16 步，最多 4 块，T=0",
]

export const planners: Planner[] = [
  { name: "Submission", code: "v8", baseline: "—", variable: "论文版，无 AW 数据，配方不同", addedRows: 0, totalRows: null, seed: 42, steps: null, hardware: "—", aw116: 9, dev209: null, status: "done" },
  { name: "Teacher", code: "v9-awt1", baseline: "Submission", variable: "加教师轨迹，同时换 v9 配方", addedRows: 13061, totalRows: 27228, seed: 42, steps: 3404, hardware: "4×H100", aw116: 23, dev209: 48, status: "done" },
  { name: "Teacher-Seed4242", code: "v9awt1s4242", baseline: "Teacher", variable: "只换 seed", addedRows: 0, totalRows: 27228, seed: 4242, steps: 3404, hardware: "待定", aw116: null, dev209: null, status: "not-trained" },
  { name: "TeacherCorrect", code: "dagger", baseline: "Teacher", variable: "加教师纠错数据", addedRows: 4753, totalRows: 31981, seed: 42, steps: 3998, hardware: "4×H100", aw116: 27, dev209: null, status: "done" },
  { name: "SelfLearn", code: "rft", baseline: "Teacher", variable: "加学生成功轨迹和分叉点纠正", addedRows: 1466, totalRows: 28694, seed: 42, steps: 3588, hardware: "4×H100", aw116: 32, dev209: 60, status: "done" },
  { name: "SelfLearn-Seed4242", code: "rfts4242", baseline: "SelfLearn", variable: "只换 seed", addedRows: 0, totalRows: 28694, seed: 4242, steps: 3588, hardware: "待定", aw116: null, dev209: null, status: "not-trained" },
  { name: "SelfLearn-Stop", code: "rftterm", baseline: "SelfLearn", variable: "加结束相关的行", addedRows: 259, totalRows: 28953, seed: 42, steps: 3620, hardware: "H100 + A800", aw116: 26, dev209: 54, status: "done" },
  { name: "SelfLearn-NoFirstStep", code: "rftnos0", baseline: "SelfLearn", variable: "去掉第 0 步的行", addedRows: 1281, totalRows: 28509, seed: 42, steps: 3564, hardware: "待定", aw116: null, dev209: null, status: "not-trained" },
  { name: "SelfLearn-Round2", code: "rftr1", baseline: "SelfLearn-NoFirstStep", variable: "加第二轮学生数据", addedRows: 2078, totalRows: 29306, seed: 42, steps: 3664, hardware: "4×H100", aw116: 31, dev209: 59, status: "done" },
  { name: "SelfLearn-AC14k", code: "rftac", baseline: "SelfLearn", variable: "加 1.4 万行 AndroidControl", addedRows: 15469, totalRows: 42697, seed: 42, steps: 5338, hardware: "4×H100", aw116: 23, dev209: 68, status: "done" },
  { name: "SelfLearn-ACFull", code: "rftacfull", baseline: "SelfLearn-AC14k", variable: "AC 换成全量", addedRows: 58148, totalRows: 85376, seed: 42, steps: 10672, hardware: "8×A100", aw116: null, dev209: null, status: "done", note: "11-12 训完（8 卡约 12.8 小时），收尾检查通过；还没评测" },
]

export const grounders = [
  { name: "Grounder-Base", code: "step-0002066", baseline: "—", variable: "论文版", data: "Mind2Web 7,341 + OpenMobile 8,264", trainable: "语言 LoRA", resolution: "980", pro: 5.4, v2: 76.6, status: "done" as Status },
  { name: "Grounder-Desktop", code: "osatlas", baseline: "Grounder-Base", variable: "加 OS-Atlas", data: "再加 8,960 行", trainable: "语言 LoRA", resolution: "980", pro: 7.5, v2: 80.7, status: "done" as Status },
  { name: "Grounder-HighRes", code: "hr98", baseline: "Grounder-Desktop", variable: "分辨率加视觉部分可训", data: "同 Desktop", trainable: "语言 + 视觉 LoRA", resolution: "1,372", pro: 13.0, v2: null, status: "failed" as Status },
  { name: "Grounder-Tiles", code: "AnyRes", baseline: "Grounder-Desktop", variable: "输入改成总览图加切块", data: "同 Desktop，部分切块", trainable: "语言 LoRA", resolution: "980 分块", pro: 0.2, v2: 55.5, status: "failed" as Status },
]

export const groundingBenchmarks = [
  { name: "MMBench-GUI L2", size: "3,594 题", metric: "官方平均", base: 43.3, desktop: 49.2, baseZoom: 55.0, desktopZoom: 59.3, mobileBase: 60.9, mobileDesktop: 66.8, p: "1e-26", published: "UI-Ins-7B 83.1，MAI-UI-32B 91.3" },
  { name: "VenusBench-GD", size: "6,165 题", metric: "官方总分（899 道拒答题记 0）", base: 22.8, desktop: 26.3, baseZoom: 36.4, desktopZoom: 39.9, mobileBase: 43.3, mobileDesktop: 46.4, p: "4e-23", published: "OS-Atlas-7B 27.4，UI-TARS-7B 39.7，Qwen2.5-VL-7B 41.1" },
  { name: "UI-I2E-Bench", size: "1,477 题", metric: "准确率", base: 45.0, desktop: 52.2, baseZoom: 47.9, desktopZoom: 57.5, mobileBase: 58.7, mobileDesktop: 67.4, p: "9e-18", published: "OS-Atlas-7B 58.6，UI-TARS-1.5-7B 73.2，GTA1-7B 78.2" },
]

export const groundingBenchmarkNotes = [
  "LLaDA-UI 没有报告这三个基准。公开分数用的是各模型自己的 prompt 和分辨率，只作参照。",
  "Grounder-Desktop 在三个基准上都显著高于 Grounder-Base，手机子集上也成立。",
  "两次放大只对横屏大图起作用，桌面和网页截图提升 10 到 16 个百分点，手机截图基本不变。",
  "和训练数据没有同图同指令的题；去掉近似图后分数和结论不变。",
  "Grounder-Base 的 v2 分数由 73.7% 更正为 76.6%：73.7% 是论文里 ScreenSpot v1 的分数，同在 v2 上是 974 对 1,027 题。",
]

export const inference = [
  { name: "全图 980", code: "full @70", pro: 88, v2: 1027, seconds: null, kv: false, note: "基准" },
  { name: "高清单图", code: "full @98", pro: 150, v2: 1011, seconds: null, kv: false, note: "" },
  { name: "一次放大", code: "zoom98", pro: 376, v2: 1032, seconds: 3.0, kv: false, note: "" },
  { name: "两次放大", code: "cascade3", pro: 400, v2: 1027, seconds: 5.1, kv: false, note: "建议作为默认" },
  { name: "三窗口选优", code: "E1", pro: 409, v2: 1034, seconds: 11.7, kv: true, note: "对两次放大 p=0.49" },
  { name: "四窗口选优", code: "E1+", pro: 427, v2: 1033, seconds: null, kv: true, note: "次要分析，需独立确认" },
  { name: "三窗口 + 压缩", code: "kvchain default", pro: 405, v2: 1029, seconds: null, kv: true, note: "不退步，但无可测收益" },
  { name: "三窗口 + 强压缩", code: "kvchain strong", pro: 396, v2: 1011, seconds: null, kv: true, note: "v2 显著退步" },
]

export const proTotal = 1181
export const v2Total = 1272

export const datasets = [
  { name: "OpenMobile 离线集", use: "规划", size: "1,501 步", role: "正式测试", note: "含论文口径和统一口径" },
  { name: "AndroidWorld 正式题", use: "规划", size: "116 题", role: "正式测试", note: "seed 30，域内，已反复使用" },
  { name: "AndroidWorld 开发题", use: "规划", size: "209 题", role: "开发", note: "来自训练 seed，用于比较模型" },
  { name: "AndroidControl", use: "规划", size: "1,543 episode / 8,444 步", role: "尚未测我们的模型", note: "train 13,603 个 episode，需要先做级联" },
  { name: "ScreenSpot-v2", use: "定位", size: "1,272 题", role: "正式测试", note: "主要作不退步检查" },
  { name: "ScreenSpot-Pro", use: "定位", size: "1,581 题", role: "正式测试", note: "主比较用 1,181 题，已反复使用" },
  { name: "Mind2Web", use: "定位", size: "6,055 条", role: "正式测试", note: "裁剪图约 81%，整页 27%" },
  { name: "OpenMobile 定位", use: "定位", size: "—", role: "正式测试", note: "手机端定位" },
]

export const published = [
  { benchmark: "ScreenSpot-v2", theirs: "90.7%", ours: "80.7%" },
  { benchmark: "ScreenSpot-Pro", theirs: "52.9%", ours: "12.7%（单图），33.9–36.2%（放大）" },
  { benchmark: "AndroidWorld", theirs: "53.5%", ours: "27.6%（域内）" },
  { benchmark: "MobileWorld", theirs: "25.6%", ours: "未测" },
  { benchmark: "OSWorld-Verified", theirs: "29.4%", ours: "未测" },
  { benchmark: "Mind2Web", theirs: "未报告", ours: "约 81%（裁剪图）" },
]

export const controlGaps = [
  { title: "没有噪声基线", detail: "两个 Seed4242 都没训练，不知道换种子本身会差多少。SelfLearn 的 +9 里有多少是波动说不清。这是最大的缺口。" },
  { title: "一次改了多个变量", detail: "Teacher 同时加数据和换配方；SelfLearn-Round2 同时去掉第 0 步并加新数据；Grounder-HighRes 同时改分辨率和可训练部分。" },
  { title: "步数跟着数据量变", detail: "epoch 固定为 2，步数从 3,404 到 10,672 不等，数据量和训练步数的影响分不开。" },
  { title: "硬件不一致", detail: "SelfLearn-Stop 的 epoch 1 在 4×H100，epoch 2 在 2×A800，RNG 没有恢复。" },
]

export const nextSteps = [
  { title: "错题引导第 2 轮（SelfLearn-Guided 的数据）", why: "SelfLearn 只能从自己做对的题里学。先用 1,031 个新实例找出它做错的题，再让教师在错题上接手做完，只留官方检查器判成功的过程", state: "运行中：第 1 步找错题（11-12 01:43 开始）；教师接管和文字提示的采集器已写好，等找错题跑完后先小规模试跑" },
  { title: "训练 Teacher-Seed4242 和 SelfLearn-Seed4242", why: "补上噪声基线", state: "等决定" },
  { title: "训练 SelfLearn-NoFirstStep", why: "拆开 SelfLearn-Round2 的两个变量", state: "等决定" },
  { title: "默认推理定为两次放大", why: "和选窗差异不显著，耗时不到一半", state: "等决定" },
  { title: "评测 AndroidControl 测试集", why: "SelfLearn、SelfLearn-AC14k、SelfLearn-ACFull 三个规划器配对比较", state: "等决定（SelfLearn-ACFull 已停）" },
]

export const dataColumns = [
  { key: "openMobile", label: "OpenMobile", hint: "基础手机示范" },
  { key: "teacher", label: "教师轨迹", hint: "教师模型在 AW 上的成功操作" },
  { key: "correction", label: "教师纠错", hint: "教师纠正学生的错误" },
  { key: "student", label: "学生轨迹", hint: "模型自己的成功操作和分叉点纠正" },
  { key: "stop", label: "结束数据", hint: "教模型何时停下" },
  { key: "round2", label: "第二轮学生", hint: "用 SelfLearn 再采一轮" },
  { key: "androidControl", label: "AndroidControl", hint: "外部手机示范，无结束动作" },
] as const

export type DataKey = (typeof dataColumns)[number]["key"]

export type Matrix = {
  name: string
  family: string
  question: string
  rows: Partial<Record<DataKey, number>>
  changed: (DataKey | "seed" | "recipe")[]
}

const base = { openMobile: 14167, teacher: 13061 }

export const matrix: Matrix[] = [
  { name: "Submission", family: "基线", question: "论文投稿版，作为起点", rows: { openMobile: 13004 }, changed: [] },
  { name: "Teacher", family: "基线", question: "加教师轨迹有没有用？", rows: base, changed: ["teacher", "recipe"] },
  { name: "Teacher-Seed4242", family: "噪声检查", question: "Teacher 换种子会差多少？", rows: base, changed: ["seed"] },
  { name: "TeacherCorrect", family: "教师路线", question: "让教师纠错有没有用？", rows: { ...base, correction: 4753 }, changed: ["correction"] },
  { name: "SelfLearn", family: "自学路线", question: "学自己的成功轨迹有没有用？", rows: { ...base, student: 1466 }, changed: ["student"] },
  { name: "SelfLearn-Seed4242", family: "噪声检查", question: "SelfLearn 换种子会差多少？", rows: { ...base, student: 1466 }, changed: ["seed"] },
  { name: "SelfLearn-Stop", family: "自学路线", question: "加结束数据能解决做对了不停吗？", rows: { ...base, student: 1466, stop: 259 }, changed: ["stop"] },
  { name: "SelfLearn-NoFirstStep", family: "自学路线", question: "去掉第 0 步的行有影响吗？", rows: { ...base, student: 1281 }, changed: ["student"] },
  { name: "SelfLearn-Round2", family: "自学路线", question: "再采一轮还能提升吗？", rows: { ...base, student: 1281, round2: 797 }, changed: ["round2"] },
  { name: "SelfLearn-AC14k", family: "外部数据", question: "加 1.4 万行 AndroidControl 有用吗？", rows: { ...base, student: 1466, androidControl: 14003 }, changed: ["androidControl"] },
  { name: "SelfLearn-ACFull", family: "外部数据", question: "AndroidControl 用满会怎样？", rows: { ...base, student: 1466, androidControl: 56682 }, changed: ["androidControl"] },
]

export const families = ["基线", "噪声检查", "教师路线", "自学路线", "外部数据"]
