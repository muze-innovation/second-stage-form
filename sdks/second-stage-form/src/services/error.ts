export class CustomError {
  public static make(): CustomError {
    return new CustomError()
  }
  private mepperErrorCode = {
    MAX_FILE_SIZE: 'file size is over',
  }
}
