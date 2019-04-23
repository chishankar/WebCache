var path = require('path');

// Class for building paths
export class ResourcePaths{

  constructor(path) {

    this.curr_dir = this.getBaseDirectory();
    this.file_path = path;

  }

  // Gets base directory of WebCache
  getBaseDirectory = () => {

    return path.resolve(__dirname,'..');

  }

  // Gets base resource directory
  getResourceDir = () => {

    return path.join(this.getBaseDirectory(),this.file_path) + '/'

  }

  // Creates full path of resource with the index.html
  getFullPath = () => {

    if(this.file_path.includes(this.curr_dir)){
      return this.file_path;
    }

    if (!this.file_path.startsWith("app") && !this.file_path.startsWith("render")){

      console.log(this.file_path);
      this.file_path = path.join(this.file_path,"index.html");

    }

    return path.join(this.curr_dir,this.file_path);

  }

  // Creates full file thingy
  getFilePath = () => {

    return "file://" + this.getFullPath();

  }

}
