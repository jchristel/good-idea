import json
from tqdm import tqdm

with open('revit_viz/json_LibraryFams_.json') as f:
    lib_fams = json.load(f)

# get all the nodes with a recursive call

nodes = []
links = []
id_count = 0


def get_nodes(head_dict, nodes, links, parent=None):
    for k, v in head_dict.items():
        if k == "ID":
            nodes.append(v)
            if parent is not None:
                links.append({
                    "source": nodes.index(parent),
                    "target": len(nodes) - 1,
                    'value': 1
                })
            parent = v
        elif k == "Children":
            for x, y in v.items():
                if x != "$id":
                    get_nodes(y, nodes, links, parent)


for fam in lib_fams:
    get_nodes(fam, nodes, links)
# print(nodes)

nodes = [{"name": node} for node in nodes]
with open('revit_viz/clean_lib_fam.json', 'w') as f:
    json.dump({'nodes': nodes, 'links': links}, f)