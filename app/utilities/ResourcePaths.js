
export class ResourcePaths{
  constructor(file: string) {
    this.file_path = file;
  }

  getFullPath = () => {
    var updatedDirname = __dirname;

    if (this.file_path.startsWith('data')){
      updatedDirname = __dirname.toString().replace("app","")
    }

    let fullPath = updatedDirname +this. file_path;
    return (fullPath)
  }
}
