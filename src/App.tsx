import { Activity, CircleAlert, FlaskConical, ListChecks } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  controlGaps, datasets, fixedRecipe, grounders, inference, nextSteps, type Planner, planners,
  proTotal, published, type Status, updatedAt, v2Total,
} from "@/data/experiments"

const statusLabel: Record<Status, string> = {
  done: "已完成", pending: "待评测", stopped: "已停止", failed: "失败", "not-trained": "未训练",
}

const statusVariant: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  done: "default", pending: "secondary", stopped: "outline", failed: "destructive", "not-trained": "outline",
}

const n = (value: number | null) => (value === null ? "—" : value.toLocaleString("en-US"))
const pct = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}%`)
const share = (p: Planner) => {
  if (!p.addedRows || !p.totalRows) return "—"
  return `${((p.addedRows / p.totalRows) * 100).toFixed(1)}%`
}

function StatusBadge({ status }: { status: Status }) {
  return <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground text-sm">{hint}</CardContent>
    </Card>
  )
}

const awConfig = {
  aw116: { label: "AW 正式题 116", color: "var(--chart-1)" },
  dev209: { label: "AW 开发题 209", color: "var(--chart-3)" },
} satisfies ChartConfig

const proConfig = {
  rate: { label: "Pro 命中率 %", color: "var(--chart-1)" },
} satisfies ChartConfig

function PlannerChart() {
  const data = planners.filter((p) => p.aw116 !== null)
  return (
    <Card>
      <CardHeader>
        <CardTitle>AndroidWorld 成功题数</CardTitle>
        <CardDescription>都是单 seed。除 Submission 外都是域内结果，不能和 Submission 直接并列。</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={awConfig} className="h-72 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="aw116" fill="var(--color-aw116)" radius={4} />
            <Bar dataKey="dev209" fill="var(--color-dev209)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function InferenceChart() {
  const data = inference.map((i) => ({ name: i.name, rate: Number(((i.pro / proTotal) * 100).toFixed(1)) }))
  return (
    <Card>
      <CardHeader>
        <CardTitle>ScreenSpot-Pro 命中率</CardTitle>
        <CardDescription>未训练新模型，只改推理。Pro 这批题已被反复使用，这些数字不能算独立确认。</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={proConfig} className="h-72 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={70} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="rate" fill="var(--color-rate)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function Overview() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="AW 正式题最好" value="32 / 116" hint="SelfLearn，单 seed，域内" />
        <Stat label="AW 开发题最好" value="68 / 209" hint="SelfLearn-AC14k，但正式题只有 23" />
        <Stat label="Pro 最好（可用）" value="33.9%" hint="两次放大，建议默认" />
        <Stat label="v2 最好（单图）" value="80.7%" hint="Grounder-Desktop" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListChecks className="size-4" />下一步</CardTitle>
            <CardDescription>按优先级排列</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {nextSteps.map((step, index) => (
              <div key={step.title} className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{index + 1}. {step.title}</p>
                  <p className="text-muted-foreground text-sm">{step.why}</p>
                </div>
                <Badge variant="outline" className="shrink-0">{step.state}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CircleAlert className="size-4" />变量控制的缺口</CardTitle>
            <CardDescription>读结果时要记住这些限制</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {controlGaps.map((gap) => (
              <div key={gap.title}>
                <p className="font-medium">{gap.title}</p>
                <p className="text-muted-foreground text-sm">{gap.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>与 LLaDA-UI 公开成绩对比</CardTitle>
          <CardDescription>公开数字未复现，协议也不同，只作参考。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>基准</TableHead><TableHead>LLaDA-UI</TableHead><TableHead>我们</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {published.map((row) => (
                <TableRow key={row.benchmark}>
                  <TableCell className="font-medium">{row.benchmark}</TableCell>
                  <TableCell>{row.theirs}</TableCell>
                  <TableCell className="whitespace-normal">{row.ours}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Planners() {
  return (
    <div className="grid gap-6">
      <PlannerChart />
      <Card>
        <CardHeader>
          <CardTitle>固定不变的部分</CardTitle>
          <CardDescription>除 Submission 外，下面每个模型都相同</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {fixedRecipe.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>规划器变量表</CardTitle>
          <CardDescription>新增行相对 27,228 行基础数据计算；每行只和“对比基线”比较。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>训练名</TableHead><TableHead>对比基线</TableHead><TableHead>改变的变量</TableHead>
                <TableHead className="text-right">新增行</TableHead><TableHead className="text-right">总行数</TableHead>
                <TableHead className="text-right">占比</TableHead><TableHead className="text-right">seed</TableHead>
                <TableHead className="text-right">步数</TableHead><TableHead>硬件</TableHead>
                <TableHead className="text-right">AW 116</TableHead><TableHead className="text-right">开发 209</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {planners.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-muted-foreground font-mono text-xs">{p.code}</div>
                  </TableCell>
                  <TableCell>{p.baseline}</TableCell>
                  <TableCell>{p.variable}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(p.addedRows)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(p.totalRows)}</TableCell>
                  <TableCell className="text-right tabular-nums">{share(p)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.seed}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(p.steps)}</TableCell>
                  <TableCell>{p.hardware}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(p.aw116)}</TableCell>
                  <TableCell className="text-right tabular-nums">{n(p.dev209)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                    {p.note && <div className="text-muted-foreground mt-1 text-xs">{p.note}</div>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Grounders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>定位器变量表</CardTitle>
        <CardDescription>Pro 和 v2 都是原生单图协议。</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>训练名</TableHead><TableHead>对比基线</TableHead><TableHead>改变的变量</TableHead><TableHead>数据</TableHead>
              <TableHead>可训练部分</TableHead><TableHead>分辨率</TableHead>
              <TableHead className="text-right">Pro</TableHead><TableHead className="text-right">v2</TableHead><TableHead>状态</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grounders.map((g) => (
              <TableRow key={g.name}>
                <TableCell>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-muted-foreground font-mono text-xs">{g.code}</div>
                </TableCell>
                <TableCell>{g.baseline}</TableCell>
                <TableCell>{g.variable}</TableCell>
                <TableCell>{g.data}</TableCell>
                <TableCell>{g.trainable}</TableCell>
                <TableCell>{g.resolution}</TableCell>
                <TableCell className="text-right tabular-nums">{pct(g.pro)}</TableCell>
                <TableCell className="text-right tabular-nums">{pct(g.v2)}</TableCell>
                <TableCell><StatusBadge status={g.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function Inference() {
  return (
    <div className="grid gap-6">
      <InferenceChart />
      <Card>
        <CardHeader>
          <CardTitle>推理方法</CardTitle>
          <CardDescription>都用 Grounder-Desktop。Pro {proTotal.toLocaleString("en-US")} 题，v2 {v2Total.toLocaleString("en-US")} 题。</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>方法</TableHead><TableHead>KV 检索</TableHead><TableHead className="text-right">Pro</TableHead>
                <TableHead className="text-right">v2</TableHead><TableHead className="text-right">每题耗时</TableHead><TableHead>说明</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inference.map((i) => (
                <TableRow key={i.code}>
                  <TableCell>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-muted-foreground font-mono text-xs">{i.code}</div>
                  </TableCell>
                  <TableCell>{i.kv ? "用" : "不用"}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.pro} ({((i.pro / proTotal) * 100).toFixed(1)}%)</TableCell>
                  <TableCell className="text-right tabular-nums">{n(i.v2)}</TableCell>
                  <TableCell className="text-right tabular-nums">{i.seconds === null ? "—" : `${i.seconds} s`}</TableCell>
                  <TableCell>{i.note || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Datasets() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>数据集</CardTitle>
        <CardDescription>正式测试集 6 个；AW 开发题不算测试集，AndroidControl 还没测我们的模型。</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>数据集</TableHead><TableHead>用途</TableHead><TableHead>规模</TableHead><TableHead>角色</TableHead><TableHead>说明</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {datasets.map((d) => (
              <TableRow key={d.name}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell>{d.use}</TableCell>
                <TableCell>{d.size}</TableCell>
                <TableCell><Badge variant={d.role === "正式测试" ? "default" : "outline"}>{d.role}</Badge></TableCell>
                <TableCell>{d.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default function App() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <FlaskConical className="size-6" />Train Tracer
          </h1>
          <p className="text-muted-foreground mt-1">GUI 代理训练实验记录：变了什么、结果如何、下一步做什么</p>
        </div>
        <p className="text-muted-foreground flex items-center gap-1 text-sm"><Activity className="size-4" />数据更新于 {updatedAt}</p>
      </header>
      <Tabs defaultValue="overview" className="gap-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="planners">规划器</TabsTrigger>
          <TabsTrigger value="grounders">定位器</TabsTrigger>
          <TabsTrigger value="inference">推理方法</TabsTrigger>
          <TabsTrigger value="datasets">数据集</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="planners"><Planners /></TabsContent>
        <TabsContent value="grounders"><Grounders /></TabsContent>
        <TabsContent value="inference"><Inference /></TabsContent>
        <TabsContent value="datasets"><Datasets /></TabsContent>
      </Tabs>
    </main>
  )
}
