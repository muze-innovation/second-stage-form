import type { Model, UploadFilesEvent } from 'survey-core'
import { ICustomOnUploadFiles, SurveyModelCustomizer } from '../../interfaces'

export class CustomOnUploadFilesBuilder implements ICustomOnUploadFiles {
  public static make(): CustomOnUploadFilesBuilder {
    return new CustomOnUploadFilesBuilder()
  }
  private cacheFunctions: Record<
    string,
    {
      callback: (files: File[]) => Promise<string[]>
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
    func: (files: File[]) => Promise<string[]>,
    onValidate: ((files: File[]) => Promise<string>)[] = [],
  ): this {
    const key = typeof path === 'string' ? path : path.name
    this.cacheFunctions[key] = {
      callback: func,
      validation: onValidate,
    }
    return this
  }

  public addCustomError(path: string) {
    //
  }

  // add validate max file size
  build(): SurveyModelCustomizer {
    return (model: Model) => {
      model.onUploadFiles.add(async (s, o) => {
        const func = this.cacheFunctions[o.question.name] || this.cacheFunctions['*']

        if (!func) {
          throw new Error('cannot find custom function')
        }
        try {
          this.validate(o)

          for (const validate of func.validation) {
            validate(o.files)
          }

          const resp = await func.callback(o.files)

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
}
