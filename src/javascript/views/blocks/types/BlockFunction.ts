import { PageImageType } from 'javascript/types/ModelTypes'

export type BlockFunction<Block = {}, Props = {}> = (
  block: Block,
  assets: { 'page-images': PageImageType[] },
  props?: Props & { adminMode?: boolean },
) => any
