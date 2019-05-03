from suffix_trees import STree

def index_file(fileName, tree):

  with open(fileName, 'r') as file:
    tree.build()
