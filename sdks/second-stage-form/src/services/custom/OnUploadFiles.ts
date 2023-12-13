import type { EventBase, SurveyModel, UploadFilesEvent } from 'survey-core'
import { ICustomOnUploadFiles } from '../../interfaces'

export class CustomOnUploadFiles implements ICustomOnUploadFiles {
  constructor(private _uploadFiles: EventBase<SurveyModel, UploadFilesEvent>) {
    //
  }
  private cacheFunctions: Record<
    string,
    {
      callback: (files: File) => Promise<string>
      validation: ((files: File[]) => Promise<string>)[]
    }
  > = {}

  private validate(option: UploadFilesEvent) {
    const { jsonObj } = option.question as any

    // validate max size

    if (jsonObj.maxFiles < option.files.length) {
      // create new error class
      throw new Error('is over max file size')
    }

    for (const file of option.files) {
      if (jsonObj.maxSize < file.size) {
        throw new Error('')
      }
    }
  }

  public add(
    path: '*' | { name: string },
    func: (files: File) => Promise<string>,
    onValidate: ((files: File[]) => Promise<string>)[] = [],
  ): this {
    const key = typeof path === 'string' ? path : path.name
    this.cacheFunctions[key] = {
      callback: func,
      validation: onValidate,
    }
    return this
  }
  // add validate max file size

  public async build(): Promise<void> {
    this._uploadFiles.add(async (s, o) => {
      const func = this.cacheFunctions['*'] || this.cacheFunctions[o.question.name]

      if (!func) {
        throw new Error('can not found custom function')
      }
      try {
        this.validate(o)

        for (const validate of func.validation) {
          validate(o.files)
        }

        const resp = await Promise.all(o.files.map(func.callback))

        o.callback(
          'success',
          resp.map((r, i) => ({
            file: o.files[i],
            name: o.files[i].name,
            content: r,
          })),
        )
      } catch (error) {
        o.callback('error', (error as any)?.message)
      }
    })
  }
}
