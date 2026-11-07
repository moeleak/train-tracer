import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { dataColumns, families, fixedRecipe, matrix, type Planner, planners, type Status } from "@/data/experiments"
import { cn } from "@/lib/utils"

const statusText: Record<Status, string> = {
  done: "已出结果", training: "训练中", pending: "待评测", stopped: "已停止", failed: "失败", "not-trained": "未训练",
}

function Delta({ before, after }: { before: number | null | undefined; after: number | null }) {
  if (after === null) return <span className="text-foreground/70">无结果</span>
  if (before === null || before === undefined) return <span className="font-semibold">{after}</span>
  const diff = after - before
  const color = diff > 0 ? "text-emerald-700 dark:text-emerald-400" : diff < 0 ? "text-red-700 dark:text-red-400" : ""
  return (
    <span className="inline-flex items-center gap-1 font-semibold tabular-nums">
      {before}<ArrowRight className="size-3.5" />{after}
      <span className={color}>（{diff > 0 ? "+" : ""}{diff}）</span>
    </span>
  )
}

function DataMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">每个实验用了哪些数据</CardTitle>
        <p className="text-base">
          数字是行数。<span className="bg-primary text-primary-foreground rounded px-1.5 py-0.5 font-medium">深色格子</span>是这个实验相对基线改动的地方，其余都和基线相同。
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-[15px]">
          <thead>
            <tr>
              <th className="bg-card sticky left-0 border-b-2 p-3 text-left font-semibold">实验</th>
              {dataColumns.map((c) => (
                <th key={c.key} className="border-b-2 p-3 text-right align-bottom font-semibold">
                  {c.label}
                  <div className="text-foreground/70 text-xs font-normal">{c.hint}</div>
                </th>
              ))}
              <th className="border-b-2 p-3 text-right align-bottom font-semibold">种子</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((m) => {
              const planner = planners.find((p) => p.name === m.name)
              return (
                <tr key={m.name} className="border-b">
                  <td className="bg-card sticky left-0 p-3 font-semibold whitespace-nowrap">{m.name}</td>
                  {dataColumns.map((c) => {
                    const value = m.rows[c.key]
                    const changed = m.changed.includes(c.key)
                    return (
                      <td key={c.key} className="p-1.5 text-right tabular-nums">
                        <span className={cn("block rounded px-2 py-1.5", changed && "bg-primary text-primary-foreground font-semibold", !value && "text-foreground/30")}>
                          {value ? value.toLocaleString("en-US") : "·"}
                        </span>
                      </td>
                    )
                  })}
                  <td className="p-1.5 text-right tabular-nums">
                    <span className={cn("block rounded px-2 py-1.5", m.changed.includes("seed") && "bg-primary text-primary-foreground font-semibold")}>{planner?.seed}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

function ExperimentCard({ p, question }: { p: Planner; question: string }) {
  const baseline = planners.find((item) => item.name === p.baseline)
  const missingBaseline = baseline && baseline.aw116 === null && p.aw116 !== null
  const reference = missingBaseline ? planners.find((item) => item.name === "SelfLearn") : baseline
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{p.name}</CardTitle>
          <Badge variant={p.status === "done" ? "default" : "outline"}>{statusText[p.status]}</Badge>
        </div>
        <p className="text-base font-medium">{question}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-2 text-[15px]">
          <dt className="text-foreground/70">和谁比</dt><dd>{p.baseline}</dd>
          <dt className="text-foreground/70">{p.baseline === "—" ? "说明" : "只改了"}</dt><dd className="font-semibold">{p.variable}</dd>
          <dt className="text-foreground/70">AW 116</dt><dd><Delta before={reference?.aw116} after={p.aw116} /></dd>
          <dt className="text-foreground/70">开发 209</dt><dd><Delta before={reference?.dev209} after={p.dev209} /></dd>
        </dl>
        {missingBaseline && <p className="mt-3 text-sm">基线未训练，这里暂时和 SelfLearn 比，改了两个变量，结论不干净。</p>}
        {p.note && <p className="mt-3 text-sm">{p.note}</p>}
      </CardContent>
    </Card>
  )
}

export function PlannerView() {
  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader><CardTitle className="text-lg">除 Submission 外，所有实验都相同的部分</CardTitle></CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-[15px]">
            {fixedRecipe.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </CardContent>
      </Card>
      <DataMatrix />
      {families.map((family) => (
        <section key={family} className="grid gap-4">
          <h2 className="text-xl font-semibold">{family}</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {matrix.filter((m) => m.family === family).map((m) => {
              const p = planners.find((item) => item.name === m.name)
              return p ? <ExperimentCard key={m.name} p={p} question={m.question} /> : null
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
