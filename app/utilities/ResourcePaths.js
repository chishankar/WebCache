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

  // Gets resource directory
  getResourceDir = () => {

    return path.join(this.getBaseDirectory(),this.file_path) + '/';

  }

  // gets resource base
  getResourceBase = () => {
    return path.normalize(path.join(this.getBaseDirectory(), this.file_path) + '/../');
  }

  // Creates full path of resource with the index.html
  getFullPath = () => {

    if (!this.file_path.startsWith("app") && !this.file_path.startsWith("render") && !this.file_path.endsWith('html')){
      this.file_path = path.join(this.file_path,"index.html");
    }

    return path.join(this.curr_dir,this.file_path);

  }

  // Creates full file thingy
  getFilePath = () => {

    return "file://" + this.getFullPath();

  }

}
