import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { CodingWorkspace } from "./coding-workspace"
import { DelegationGroup } from "./delegation-group"
import {
  multiAgentPrompt,
  multiAgentScenarios,
  multiAgentSelection,
  multiAgentTurnId,
  useMultiAgentPreview,
  type MultiAgentScenario,
} from "./multi-agent-demo"
import { RunOrchestration } from "./run-orchestration"
import { getWorkers, type WorkspaceView } from "./run-record"

export function MultiAgentPreviewPicker({
  value,
  onPick,
}: {
  value?: MultiAgentScenario
  onPick: (scenario: MultiAgentScenario) => void
}) {
  return (
    <ToggleGroup
      aria-label="多子 Agent 编排"
      value={value ? [value] : []}
      onValueChange={([next]) => {
        const scenario = next
          ? multiAgentScenarios.find(({ id }) => id === next)?.id
          : value
        if (scenario) onPick(scenario)
      }}
      size="sm"
      variant="outline"
      spacing={1}
      className="min-w-0 flex-wrap"
    >
      {multiAgentScenarios.map(({ id, label }) => (
        <ToggleGroupItem key={id} value={id}>
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function MultiAgentOrchestration() {
  const [preview, setPreview] = useState<{
    scenario: MultiAgentScenario
    version: number
  }>({
    scenario: "parallel",
    version: 0,
  })
  return (
    <section
      className="@container flex w-full max-w-4xl min-w-0 flex-col gap-3"
      aria-label="多子 Agent 编排预览"
    >
      <MultiAgentPreviewPicker
        value={preview.scenario}
        onPick={(scenario) =>
          setPreview((previous) => ({
            scenario,
            version: previous.version + 1,
          }))
        }
      />
      <ScenarioPreview key={preview.version} scenario={preview.scenario} />
    </section>
  )
}

function ScenarioPreview({ scenario }: { scenario: MultiAgentScenario }) {
  const preview = useMultiAgentPreview(scenario)
  const [selection, setSelection] = useState(() =>
    multiAgentSelection(scenario)
  )
  const [view, setView] = useState<WorkspaceView>("overview")
  if (!preview) return null
  const { activity, content, retry } = preview

  function inspect(workerId: string) {
    setSelection({ turnId: multiAgentTurnId, workerId })
  }

  return (
    <div className="grid min-w-0 overflow-hidden rounded-lg border bg-background @min-[37rem]:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-3 border-b p-4 @min-[37rem]:border-r @min-[37rem]:border-b-0">
        <h3 className="text-sm font-medium">子 Agent 任务</h3>
        <RunOrchestration steps={activity.steps} />
        <DelegationGroup
          workers={getWorkers(activity)}
          selectedId={selection.workerId}
          onInspect={inspect}
          onRetry={(id) => {
            if (retry(id)) inspect(id)
          }}
        />
        <p
          className="text-sm leading-6 text-muted-foreground"
          aria-live="polite"
        >
          {content}
        </p>
      </div>
      <div className="grid h-[29rem] min-w-0">
        <CodingWorkspace
          turns={[{ id: multiAgentTurnId, label: multiAgentPrompt, activity }]}
          selection={selection}
          view={view}
          followingLatest={!selection.workerId}
          onInspect={setSelection}
          onViewChange={setView}
          onFollowLatest={() =>
            setSelection({ turnId: multiAgentTurnId, workerId: undefined })
          }
        />
      </div>
    </div>
  )
}
