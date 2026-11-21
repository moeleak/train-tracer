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

export const updatedAt = "2026-11-20"

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
  { name: "SelfLearn-ACFull", code: "rftacfull", baseline: "SelfLearn-AC14k", variable: "AC 换成全量", addedRows: 58148, totalRows: 85376, seed: 42, steps: 10672, hardware: "8×A100", aw116: 23, dev209: 68, status: "done", note: "11-12 训完（8 卡约 12.8 小时）。AndroidControl 测试集步准确率 56.83%（8,444 步），比 SelfLearn-AC14k 的 51.29% 高 5.5 点、比 SelfLearn 的 33.73% 高 23.1 点，配对检验都显著；AndroidWorld 23/116、开发集 68/209" },
  { name: "SelfLearn-Guided", code: "guided", baseline: "SelfLearn", variable: "加教师接管后做成的过程", addedRows: 5354, totalRows: 32582, seed: 42, steps: 4074, hardware: "8×A100", aw116: 29, dev209: 67, status: "done", note: "没有显著提升：开发集 67 对 60（p = 0.12），正式题 29 对 32（p = 0.61），OpenMobile 45.37% 对 46.57%（−1.2 点，不显著）。提升只在有引导数据的模板上，重复动作率升高。SelfLearn 是 4×H100 训的，比较不是严格只变数据" },
  { name: "SelfLearn-ACTag", code: "rftactagt", baseline: "SelfLearn-ACFull", variable: "AndroidControl 行加环境标记，再加 3,459 行新数据", addedRows: 3459, totalRows: null, seed: 42, steps: null, hardware: "8×A100", aw116: 33, dev209: 76, status: "done", note: "目前最好的规划器。OpenMobile 49.43%（742/1,501）" },
  { name: "SelfLearn-ACTagBroad", code: "rftactagb", baseline: "SelfLearn-ACTag", variable: "再加 3,331 行覆盖更广的教师轨迹", addedRows: 3331, totalRows: null, seed: 42, steps: null, hardware: "8×A100", aw116: 29, dev209: 75, status: "done", note: "11-16 训完。两项都没有提升：AndroidWorld 29/116 对 SelfLearn-ACTag 33（只新做对 3、只旧做对 7，p = 0.34），开发集 75/209 对 76（8 / 9，p = 1.0）。错误结束变少（31 → 20），但步数耗尽变多（42 → 58），重复动作 11.9% → 18.4%。OpenMobile 初步 48.70%（731/1,501），比 SelfLearn-ACTag 少 11 条，正式打分待做。这批数据不再沿用" },
  { name: "SelfLearn-ACTag-RL", code: "grpo-pilot", baseline: "SelfLearn-ACTag", variable: "在线强化学习（GRPO）：模型自己采样做题，按官方检查器的成败调整", addedRows: null, totalRows: null, seed: 42, steps: 100, hardware: "8×A100", aw116: 39, dev209: 81, status: "done", note: "11-18 到 11-19 的试点，6 轮：每轮在 48 个训练题上各采样 8 次（采样温度 1.3，只用于生成训练数据），同一题 8 次的成败互相比较，做对的那几次加强、做错的减弱，并用 KL 约束不离 SelfLearn-ACTag 太远；评测仍是 T=0。验证集 25 → 26 → 29 → 28（第 0、2、4、6 轮后），按规则选第 4 轮（累计 100 个优化步）。开发集 81/209 对 SelfLearn-ACTag 76/209：只有它做对 11 题、只有 ACTag 做对 6 题，p = 0.33，不显著。步数耗尽 59 → 48，重复上一动作 28% → 21%，但宣布完成却做错 64 → 70。6 轮一共只走了 144 个优化步，离参考模型的 KL 只有 0.07。AndroidWorld 正式题 39/116 对 33/116：ACTag 做对的 33 题全部保住、另多做对 6 题，p = 0.031，显著（事先登记的主比较，只报告不选模型）；步数耗尽 42 → 33。OpenMobile 还没测" },
  { name: "SelfLearn-ACTag-RL2", code: "grpo-phase2", baseline: "SelfLearn-ACTag-RL", variable: "第二期：从试点第 4 轮接着训，学习率 ×3，每轮 1 遍", addedRows: null, totalRows: null, seed: 42, steps: 110, hardware: "8×A100", aw116: null, dev209: null, status: "stopped", note: "11-19 启动，计划 16 轮。每轮的更新比试点大得多（偏离采样策略 0.03–0.10，试点约 0.01–0.02），离参考模型的 KL 4 轮就到 0.14–0.17（试点 6 轮 0.07）。第 4 轮后验证集 24/64，比起点 29 少 5 题，按事先定好的规则自动停止：丢掉 5 题、没有新做对的题（p = 0.06）；步数耗尽 16 → 19，平均步数 15.2 → 16.8。没有产生新模型，最好的仍是试点第 4 轮" },
  { name: "SelfLearn-ACTag-RL3", code: "grpo-phase3", baseline: "SelfLearn-ACTag-RL", variable: "第三期：从试点第 4 轮接着训，学习率回到 1e-6、批次 128、每轮 96 题，每条 episode 权重相等，KL 设上限", addedRows: null, totalRows: null, seed: 42, steps: 92, hardware: "8×A100", aw116: null, dev209: 79, status: "stopped", note: "11-19 晚启动，计划 8 轮。验证集（128 题）起点 54，第 2 轮后 56（新做对 7、丢掉 5，不显著）。第 3 轮离参考模型的 KL 一轮涨了 0.054，超过事先定的 0.05，按规则提前结束、第 3 轮不参与选择，选第 2 轮。开发集 79/209：对试点第 4 轮 81（7 / 9，p = 0.80），对 SelfLearn-ACTag 76（9 / 6，p = 0.61），都不显著；没到 81，不跑正式题。和第二期一样，步数耗尽和重复动作变少，但宣布完成但失败变多。没有产生新模型，最好的仍是试点第 4 轮" },
  { name: "SelfLearn-ACTag-RL4", code: "grpo-phase4", baseline: "SelfLearn-ACTag-RL", variable: "第四期：配方同第三期，只把每步的优势换成步级信用（同一屏幕状态内按动作比较平均回报，状态用截图加无障碍树认定）", addedRows: null, totalRows: null, seed: 42, steps: 107, hardware: "8×A100", aw116: 37, dev209: 81, status: "done", note: "11-20 启动，6 轮全部跑完，没有触发提前结束，KL 最高 0.157。第 5 轮采样时 Lab 上有别的大编译任务，按用户决定暂停约 14 小时，等机器安静后再继续；争用期间采的 275 条已单独记录。验证集（128 个新实例）48 → 52 → 55 → 54，选第 4 轮。开发集 209 是 81/209，与试点第 4 轮完全持平（10 / 10，p = 1.0），对 SelfLearn-ACTag 76 是 12 / 7（p = 0.36）。AndroidWorld 正式题 37/116，对试点第 4 轮 39/116 是 2 / 4（p = 0.69），都不显著。步数耗尽转成宣布完成但失败的仍多于转成成功（12 对 3）。步级信用没有带来可测的提升，最好的仍是试点第 4 轮" },
  { name: "SelfLearn-ACTag-L1MCQ", code: "l1mcq-sft", baseline: "SelfLearn-ACTag", variable: "加 MMBench-GUI L1 格式的选择题：教师在我们自己的截图上出题，与规划器原数据 1:2 混合，从 SelfLearn-ACTag 接着训 1 个 epoch", addedRows: 9849, totalRows: 29547, seed: 42, steps: 231, hardware: "8×A100", aw116: null, dev209: null, status: "done", note: "11-20 训完。MMBench-GUI 没有训练集：教师在 3,618 张非评测截图（已对 12 个评测集去重，偏重 Windows/macOS）上按 L1 官方出题 prompt 出了 10,371 道选择题，抽查 10 题全对。训练目标与评测时的输出格式一致（空思考块加一个字母），学习率减半，批次 128。L1 全部 3,561 题三档平均 78.28，比 SelfLearn-ACTag 75.03 高 3.25（149 / 33，p = 8e-19），比 LLaDA-UI 74.75 高 3.53（538 / 413，p = 6e-5），都显著；约 1.4 分来自不再写不完思考文字（解析失败 116 → 0），约 1.9 分来自内容。Windows 仍低于 LLaDA-UI（72.6 对 76.5）。开发集 209（11-22，事先定的不退步检查）是 73/209，对 SelfLearn-ACTag 76/209 是 3 / 6（p = 0.51），按规则不算退步。但失败方式变了：宣布完成但失败 64 → 45，步数耗尽 59 → 80，规划器更少宣布结束" },
]

export const grounders = [
  { name: "Grounder-Base", code: "step-0002066", baseline: "—", variable: "论文版", data: "Mind2Web 7,341 + OpenMobile 8,264", trainable: "语言 LoRA", resolution: "980", pro: 5.4, v2: 76.6, status: "done" as Status },
  { name: "Grounder-Desktop", code: "osatlas", baseline: "Grounder-Base", variable: "加 OS-Atlas", data: "再加 8,960 行", trainable: "语言 LoRA", resolution: "980", pro: 7.5, v2: 80.7, status: "done" as Status },
  { name: "Grounder-HighRes", code: "hr98", baseline: "Grounder-Desktop", variable: "分辨率加视觉部分可训", data: "同 Desktop", trainable: "语言 + 视觉 LoRA", resolution: "1,372", pro: 13.0, v2: null, status: "failed" as Status },
  { name: "Grounder-Tiles", code: "AnyRes", baseline: "Grounder-Desktop", variable: "输入改成总览图加切块", data: "同 Desktop，部分切块", trainable: "语言 LoRA", resolution: "980 分块", pro: 0.2, v2: 55.5, status: "failed" as Status },
  { name: "Grounder-Scale-90k", code: "scale-s1", baseline: "Grounder-Desktop", variable: "再加约 10 倍的公开定位数据（试点）", data: "再加 89,088 行（手机 38,400、桌面 21,504、网页 29,184）", trainable: "语言 LoRA", resolution: "980", pro: null, v2: 82.2, status: "done" as Status },
  { name: "Grounder-Scale-90k-LR1e-4-AllRows", code: "r2 lr1e4-all", baseline: "Grounder-Scale-90k", variable: "学习率 1e-5 提到 1e-4，打包器不再丢行", data: "同 Scale-90k，所有行都训到", trainable: "语言 LoRA", resolution: "980", pro: null, v2: 83.4, status: "done" as Status },
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
  "Grounder-Scale-90k（选中第 2 个 epoch）的手机子集：MMBench-GUI L2 67.5、UI-I2E-Bench 67.8、VenusBench-GD 50.2；对 Grounder-Desktop 只有 VenusBench 显著提高（+3.9），另两个基本不变。",
  "Grounder-Scale-90k-LR1e-4-AllRows（选中第 1 个 epoch）的手机子集：MMBench-GUI L2 70.0、UI-I2E-Bench 74.6、VenusBench-GD 49.7；对 Grounder-Scale-90k 只有 UI-I2E 显著提高（+6.8），MMBench +2.4 未过校正门槛，VenusBench 持平。LLaDA-UI 仍高 6.7 到 27.4 个百分点。",
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
  { benchmark: "ScreenSpot-v2", theirs: "90.7%", ours: "83.4%" },
  { benchmark: "ScreenSpot-Pro", theirs: "52.9%", ours: "12.7%（单图），33.9–36.2%（放大）" },
  { benchmark: "AndroidWorld", theirs: "53.5%", ours: "33.6%（域内，39/116）" },
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
  { title: "在线强化学习试点（SelfLearn-ACTag-RL）", why: "加数据的做法在 AndroidWorld 上停在 29–33 题；文献里 SFT 之后做在线 RL（GRPO）是增益最大、最一致的一步。用户 11-18 批准只在生成训练数据时用 T>0 采样", state: "完成（11-19）。验证 25 → 26 → 29 → 28，选第 4 轮；开发集 81/209 对 76/209（p = 0.33，不显著），AndroidWorld 正式题 39/116 对 33/116（6 / 0，p = 0.031，显著）。6 轮只训了 144 步、KL 0.07。第二期（11-19）从第 4 轮接着训、学习率 ×3、每轮 1 遍，4 轮后验证掉到 24/64（起点 29），按规则自动停止，没有产生新模型。第三期（11-19 到 11-20）：回到学习率 1e-6，每轮 96 题、批次 128，每条 episode 权重相等，KL 设上限，验证集扩到 128 题。第 3 轮 KL 超限提前结束，选第 2 轮，开发集 79/209，对试点第 4 轮不显著（p = 0.80），没有产生新模型" },
  { title: "强化学习的步级信用分配（离线检查）", why: "两期继续 RL 都只是把步数耗尽换成了宣布完成但失败。0/1 的 episode 奖励给一条轨迹的每一步同样的分数，分不清哪一步错了。先在第三期已有的 rollout 上离线检查 GiGPO 式的同状态比较是否可行，不训练", state: "完成（11-20）。锚点足够：用截图相似度合并状态时，87% 的训练行落在锚点组里。但原版 GiGPO 救不回被误罚的正确步（0%）。只靠截图会把内容不同的屏幕并在一起（55%），失败的结束和成功的结束被并到一起时，九成只差在输入的值上，例如文件名或计时器数字，所以相当一部分错误结束其实是输错了值。改用截图加无障碍树内容认定状态，并在同一状态内按动作求平均回报以后，被误罚的正确步救回 84%，错误的结束成了失败轨迹里受罚最重的一步。造行脚本已支持这种做法，用它训练要新一轮采样，等决定" },
  { title: "错题引导第 2 轮（SelfLearn-Guided）", why: "SelfLearn 只能从自己做对的题里学。先找出它做错的题，再让教师在错题上接手做完，只留官方检查器判成功的过程", state: "完成（11-13）：教师在 711 个错题里做成 359 个，定稿 3,888 行；训出的 SelfLearn-Guided 三项评测都没有显著超过 SelfLearn。开发集里当初从未做对的那组从 1/96 到 5/96，但 4 个来自同一个模板；数据最多的日历添加事件类仍然全错" },
  { title: "训练 Teacher-Seed4242 和 SelfLearn-Seed4242", why: "补上噪声基线", state: "等决定" },
  { title: "训练 SelfLearn-NoFirstStep", why: "拆开 SelfLearn-Round2 的两个变量", state: "等决定" },
  { title: "默认推理定为两次放大", why: "和选窗差异不显著，耗时不到一半", state: "等决定" },
  { title: "评测 AndroidControl 测试集", why: "SelfLearn、SelfLearn-AC14k、SelfLearn-ACFull 三个规划器配对比较", state: "完成（11-12）：步准确率 33.73% / 51.29% / 56.83%；全集比 14k 抽样 +5.5 点 [4.8, 6.3]，比不加 +23.1 点，均显著。只说明 AndroidControl 域内有提升，AndroidWorld 待评" },
  { title: "LLaDA-UI 在 AndroidControl 测试集上", why: "LLaDA-UI 的论文没有报告 AndroidControl；用同一份 8,444 步测试行和同一个打分函数，与我们三个规划器逐步配对", state: "完成。步准确率：LLaDA-UI 45.9%，SelfLearn 33.7%，SelfLearn-AC14k 51.3%，SelfLearn-ACFull 56.8%，三组配对都显著。LLaDA-UI 高于没用过 AndroidControl 数据的 SelfLearn，低于两个在 AndroidControl 上微调过的模型（域内）。LLaDA-UI 点击更准（52.8% 对 50.3%），输在滚动、打开 app、返回。它有 11% 的输出被公开的 HF 解码提前截断，按协议记错；只看未截断的步是 51.5%（有选择偏差）" },
  { title: "LLaDA-UI 在 GUI-Odyssey 和 MMBench-GUI L1 上", why: "LLaDA-UI 的论文两个基准都没报告；用同一份题和同一个打分函数，与 SelfLearn-ACTag、SelfLearn-ACTag-RL 第 4 轮配对比较。LLaDA-UI 用公开权重和自带解码，不一定是它的最佳配置", state: "完成（11-19）。GUI-Odyssey（随机抽 400 条 episode、6,152 步，官方判据，T=0）AMS：LLaDA-UI 35.98，SelfLearn-ACTag + 定位器 35.71（p = 0.41，持平），RL 第 4 轮 + 定位器 33.40（低 3.0，p = 5e-5）；整条任务全对率三者都是 0。LLaDA-UI 点击更准、更会用 Home 切 app，我们更会判断何时结束。MMBench-GUI L1（全部 3,561 题，官方提示和解析）三档平均：LLaDA-UI 74.75，RL 第 4 轮 74.94，ACTag 75.03，都不显著" },
  { title: "MMBench-GUI L1 选择题训练（SelfLearn-ACTag-L1MCQ）", why: "L1 上和 LLaDA-UI 持平，弱在 Windows、macOS 和 hard 档；MMBench-GUI 没有训练集，用户选了让教师在我们自己的截图上按 L1 格式出题，并同意采完直接训练", state: "L1 完成（11-20）：三档平均 78.28（easy 76.97 / medium 76.84 / hard 81.02），对 SelfLearn-ACTag +3.25、对 LLaDA-UI +3.53，事先登记的两个主比较都显著（α = 0.025）。分平台只有 Windows 仍低于 LLaDA-UI。教师出的 522 道留出题：86.2% 对 82.6%。开发集 209 的不退步检查还没跑，需要用户决定用哪台 GPU 机器" },
  { title: "定位器瓶颈诊断（Grounder-Scale-90k）", why: "离 LLaDA-UI 的 ScreenSpot-v2 还差 121 题，先弄清是学不进去、泛化不了，还是推理方式的问题，再决定第 2 轮怎么训", state: "完成（11-15）。它在自己训练过的 OS-Atlas 行上也只答对 68.5%，和没见过的验证行（67%）差不多，属于欠拟合；ScreenSpot-v2 的差距 121 题里 92 题是图标；独错题里六成是点错元素（多是相邻的同类图标），三成是按字面找文字，差一点的只有 2/40；网格 98 和两次放大都不能挽回（1,028、1,042 对 1,046）" },
  { title: "第 2 轮定位器（学习率 / 容量）", why: "诊断显示欠拟合。并列三个候选：只把学习率从 1e-5 提到 1e-4；只加容量（LoRA 秩 128 并覆盖 MLP）；两者都改。先各跑 1,500 步的短程筛选，按事先定好的规则看训练行拟合和验证集，再选一个跑满", state: "完成（11-17）。筛选后选了只改学习率，并让打包器不再丢行，8 卡跑满。ScreenSpot-v2 1,061 题（83.4%），比 Grounder-Scale-90k 多 15 题（p = 0.18，不显著），离 LLaDA-UI 的 1,167 还差 106 题，其中 74 题是图标。三个 epoch 分别是 1,061、1,057、1,058，多训没有用；OS-Atlas 训练行仍只答对 69.5%，欠拟合基本没缓解" },
  { title: "定位的移动端对比", why: "ScreenSpot-Pro 全是桌面专业软件，没有移动端子集；改在四个基准的手机子集上比较 LLaDA-UI（16.7B）和我们的 grounder（8.46B）", state: "完成。LLaDA-UI 对 Grounder-Desktop（全图 980）：ScreenSpot-V2 mobile 91.8 对 86.0，MMBench-GUI L2 手机 87.2 对 66.6，UI-I2E-Bench mobile 81.3 对 67.4，VenusBench-GD mobile 77.1 对 46.4，四项都显著。LLaDA-UI 在 ScreenSpot-V2 全集本地复现 91.75（论文 90.7）。ScreenSpot-Pro 按相同题集更正：全集 1,581 题上 Grounder-Base 5.44%，Grounder-Desktop 7.59%" },
]

export const dataColumns = [
  { key: "openMobile", label: "OpenMobile", hint: "基础手机示范" },
  { key: "teacher", label: "教师轨迹", hint: "教师模型在 AW 上的成功操作" },
  { key: "correction", label: "教师纠错", hint: "教师纠正学生的错误" },
  { key: "student", label: "学生轨迹", hint: "模型自己的成功操作和分叉点纠正" },
  { key: "stop", label: "结束数据", hint: "教模型何时停下" },
  { key: "round2", label: "第二轮学生", hint: "用 SelfLearn 再采一轮" },
  { key: "androidControl", label: "AndroidControl", hint: "外部手机示范，无结束动作" },
  { key: "guided", label: "教师接管", hint: "教师在错题上接手做成的过程" },
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
  { name: "SelfLearn-Guided", family: "自学路线", question: "教师在错题上接手做成的过程有没有用？", rows: { ...base, student: 1466, guided: 3888 }, changed: ["guided"] },
]

export const families = ["基线", "噪声检查", "教师路线", "自学路线", "外部数据"]
