import { useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BookOpen,
  ClipboardList,
  MoreVertical,
  Copy,
  Ban,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ContentEditor } from './ContentEditor'

export type Block = {
  id: number
  title: string
  kind: 'CONTENT' | 'ASSESSMENT'
  isMandatory: boolean
  disabled?: boolean
}

type LadderProps = {
  courseId: number
  initialBlocks: Block[]
  onBlocksChange?: () => void
}

type SortableItemProps = Block & {
  onToggleMandatory: (id: number, value: boolean) => void
  onDuplicate: (id: number) => void
  onDisable: (id: number) => void
  onDelete: (id: number) => void

  loading: boolean
  onSelect: (id: number) => void

}

function SortableItem({
  id,
  title,
  kind,
  isMandatory,
  disabled,
  loading,
  onToggleMandatory,
  onDuplicate,
  onDisable,
  onDelete,
  onSelect,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const TypeIcon = kind === 'CONTENT' ? BookOpen : ClipboardList

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between border p-2 mb-2 bg-white ${
        disabled ? 'opacity-50' : ''
      }`}
      onClick={() => {
        if (kind === 'CONTENT') onSelect(id)
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <TypeIcon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isMandatory}
          onCheckedChange={(val) => onToggleMandatory(id, val)}
          disabled={loading}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={loading}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onDuplicate(id)} disabled={loading}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDisable(id)} disabled={loading}>
              <Ban className="mr-2 h-4 w-4" />{' '}
              {disabled ? 'Enable' : 'Disable'}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onDelete(id)} disabled={loading}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function Ladder({ courseId, initialBlocks, onBlocksChange }: LadderProps) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [loadingIds, setLoadingIds] = useState<number[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const { toast } = useToast()

  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null)
  useEffect(() => {
    setBlocks(initialBlocks)
  }, [initialBlocks])
  const sensors = useSensors(useSensor(PointerSensor))

  const setBlockLoading = (id: number, loading: boolean) => {
    setLoadingIds((prev) =>
      loading ? [...prev, id] : prev.filter((i) => i !== id),
    )
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isReordering) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      const newBlocks = arrayMove(blocks, oldIndex, newIndex)
      const previousBlocks = blocks
      setBlocks(newBlocks)
      setIsReordering(true)
      try {
        const res = await fetch('/api/blocks/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, order: newBlocks.map((b) => b.id) }),
        })
        if (!res.ok) throw new Error()
        onBlocksChange?.()
      } catch (e) {
        setBlocks(previousBlocks)
        toast({
          title: 'Error',
          description: 'Failed to reorder blocks',
        })
      } finally {
        setIsReordering(false)
      }
    }
  }

  const handleToggleMandatory = async (id: number, value: boolean) => {
    const previousBlocks = blocks
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isMandatory: value } : b)),
    )
    setBlockLoading(id, true)
    try {
      const res = await fetch('/api/blocks/mandatory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const { block } = await res.json()
      setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)))
      onBlocksChange?.()
    } catch (e) {
      setBlocks(previousBlocks)
      toast({
        title: 'Error',
        description: 'Failed to update mandatory status',
      })
    } finally {
      setBlockLoading(id, false)
    }
  }

  const handleDuplicate = async (id: number) => {
    setBlockLoading(id, true)
    try {
      const res = await fetch('/api/blocks/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const { block } = await res.json()
      setBlocks((prev) => [...prev, block])
      onBlocksChange?.()
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate block',
      })
    } finally {
      setBlockLoading(id, false)
    }
  }

  const handleDisable = async (id: number) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    const disabled = !block.disabled
    const previousBlocks = blocks
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, disabled } : b)),
    )
    setBlockLoading(id, true)
    try {
      const res = await fetch('/api/blocks/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const { block: updated } = await res.json()
      setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      onBlocksChange?.()
    } catch (e) {
      setBlocks(previousBlocks)
      toast({
        title: 'Error',
        description: 'Failed to update block',
      })
    } finally {
      setBlockLoading(id, false)
    }
  }

  const handleDelete = async (id: number) => {
    const previousBlocks = blocks
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setBlockLoading(id, true)
    try {
      const res = await fetch('/api/blocks/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      onBlocksChange?.()
    } catch (e) {
      setBlocks(previousBlocks)
      toast({
        title: 'Error',
        description: 'Failed to delete block',
      })
    } finally {
      setBlockLoading(id, false)
    }
  }

  const handleAddBlock = async (kind: 'CONTENT' | 'ASSESSMENT') => {
    const title =
      kind === 'CONTENT' ? 'New Content Block' : 'New Assessment Block'
    setIsAdding(true)
    try {
      const res = await fetch('/api/blocks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, kind, title }),
      })
      if (!res.ok) throw new Error()
      const { block } = await res.json()
      setBlocks((prev) => [...prev, block])
      onBlocksChange?.()
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to add block',
      })
    } finally {
      setIsAdding(false)
    }
  }
  const handleSelectBlock = (id: number) => {
    setSelectedBlockId(id)
  }

  return (
    <div className="flex gap-4">
      <aside className="w-48 border-r pr-4">
        <h3 className="mb-2 font-semibold">Add Block</h3>
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={() => handleAddBlock('CONTENT')}
          disabled={isAdding}
        >
          <BookOpen className="mr-2 h-4 w-4" /> Content
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleAddBlock('ASSESSMENT')}
          disabled={isAdding}
        >
          <ClipboardList className="mr-2 h-4 w-4" /> Assessment
        </Button>
      </aside>
      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableItem
                key={block.id}
                {...block}
                onToggleMandatory={handleToggleMandatory}
                onDuplicate={handleDuplicate}
                onDisable={handleDisable}
                onDelete={handleDelete}
                loading={loadingIds.includes(block.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
    <>
      <div className="flex gap-4">
        <aside className="w-48 border-r pr-4">
          <h3 className="mb-2 font-semibold">Add Block</h3>
          <Button
            variant="outline"
            className="w-full mb-2"
            onClick={() => handleAddBlock('CONTENT')}
          >
            <BookOpen className="mr-2 h-4 w-4" /> Content
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleAddBlock('ASSESSMENT')}
          >
            <ClipboardList className="mr-2 h-4 w-4" /> Assessment
          </Button>
        </aside>
        <div className="flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableItem
                  key={block.id}
                  {...block}
                  onToggleMandatory={handleToggleMandatory}
                  onDuplicate={handleDuplicate}
                  onDisable={handleDisable}
                  onDelete={handleDelete}
                  onSelect={handleSelectBlock}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      <Sheet
        open={selectedBlockId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBlockId(null)
        }}
      >
        <SheetContent side="right">
          {selectedBlockId !== null && (
            <ContentEditor
              blockId={selectedBlockId}
              onBlocksChange={onBlocksChange}
            />
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

