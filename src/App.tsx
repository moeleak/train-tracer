import { Activity, CircleAlert, FlaskConical, ListChecks } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { PlannerView } from "@/components/planner-view"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  controlGaps, datasets, grounders, groundingBenchmarkNotes, groundingBenchmarks, inference, nextSteps, 
  proTotal, published, type Status, updatedAt, v2Total,
} from "@/data/experiments"

const statusLabel: Record<Status, string> = {
  done: "已完成", training: "训练中", pending: "待评测", stopped: "已停止", failed: "失败", "not-trained": "未训练",
}

const statusVariant: Record<Status, "default" | "secondary" | "destructive" | "outline"> = {
  done: "default", training: "secondary", pending: "secondary", stopped: "outline", failed: "destructive", "not-trained": "outline",
}

const n = (value: number | null) => (value === null ? "—" : value.toLocaleString("en-US"))
const pct = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}%`)

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
      <CardContent className="text-foreground/75 text-sm">{hint}</CardContent>
    </Card>
  )
}

const proConfig = {
  rate: { label: "Pro 命中率 %", color: "var(--chart-1)" },
} satisfies ChartConfig

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
                  <p className="text-foreground/75 text-sm">{step.why}</p>
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
                <p className="text-foreground/75 text-sm">{gap.detail}</p>
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

function Grounders() {
  return (
    <div className="grid gap-6">
    <div className="grid gap-4 md:grid-cols-2">
      {grounders.map((g) => {
        const baseline = grounders.find((item) => item.name === g.baseline)
        return (
          <Card key={g.name}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{g.name}</CardTitle>
                <StatusBadge status={g.status} />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-2 text-[15px]">
                <dt className="text-foreground/70">和谁比</dt><dd>{g.baseline}</dd>
                <dt className="text-foreground/70">改了</dt><dd className="font-semibold">{g.variable}</dd>
                <dt className="text-foreground/70">训练数据</dt><dd>{g.data}</dd>
                <dt className="text-foreground/70">可训练</dt><dd>{g.trainable}</dd>
                <dt className="text-foreground/70">分辨率</dt><dd>{g.resolution}</dd>
                <dt className="text-foreground/70">Pro</dt><dd className="font-semibold tabular-nums">{baseline ? `${pct(baseline.pro)} → ${pct(g.pro)}` : pct(g.pro)}</dd>
                <dt className="text-foreground/70">v2</dt><dd className="font-semibold tabular-nums">{baseline ? `${pct(baseline.v2)} → ${pct(g.v2)}` : pct(g.v2)}</dd>
              </dl>
            </CardContent>
          </Card>
        )
      })}
    </div>
      <Card>
        <CardHeader>
          <CardTitle>三个新定位基准</CardTitle>
          <CardDescription>主口径是全图 980 单张截图，次要口径是两次放大。分数是百分比，p 值是 Grounder-Desktop 对 Grounder-Base 的配对检验。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>基准</TableHead>
                <TableHead className="text-right">Base 全图</TableHead><TableHead className="text-right">Desktop 全图</TableHead>
                <TableHead className="text-right">Base 放大</TableHead><TableHead className="text-right">Desktop 放大</TableHead>
                <TableHead className="text-right">手机子集（全图）</TableHead><TableHead className="text-right">p</TableHead><TableHead>公开分数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groundingBenchmarks.map((b) => (
                <TableRow key={b.name}>
                  <TableCell>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-foreground/75 text-xs">{b.size}，{b.metric}</div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{b.base.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{b.desktop.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.baseZoom.toFixed(1)}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{b.desktopZoom.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.mobileBase.toFixed(1)} → {b.mobileDesktop.toFixed(1)}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.p}</TableCell>
                  <TableCell className="whitespace-normal">{b.published}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ul className="grid list-disc gap-1 pl-5 text-[15px]">
            {groundingBenchmarkNotes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </CardContent>
      </Card>
    </div>
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
                    <div className="text-foreground/75 font-mono text-xs">{i.code}</div>
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
          <p className="text-foreground/75 mt-1">GUI 代理训练实验记录：变了什么、结果如何、下一步做什么</p>
        </div>
        <p className="text-foreground/75 flex items-center gap-1 text-sm"><Activity className="size-4" />数据更新于 {updatedAt}</p>
      </header>
      <Tabs
        defaultValue={location.hash.slice(1) || "overview"}
        onValueChange={(value) => history.replaceState(null, "", `#${value}`)}
        className="gap-6"
      >
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="planners">规划器</TabsTrigger>
          <TabsTrigger value="grounders">定位器</TabsTrigger>
          <TabsTrigger value="inference">推理方法</TabsTrigger>
          <TabsTrigger value="datasets">数据集</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><Overview /></TabsContent>
        <TabsContent value="planners"><PlannerView /></TabsContent>
        <TabsContent value="grounders"><Grounders /></TabsContent>
        <TabsContent value="inference"><Inference /></TabsContent>
        <TabsContent value="datasets"><Datasets /></TabsContent>
      </Tabs>
    </main>
  )
}
