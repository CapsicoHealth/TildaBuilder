"use strict";

import { FloriaDOM } from "/static/floria.v2.0/module-dom.js";


export class FloriaTreeView {
  constructor(rootNodes) {
    this.rootNodes = rootNodes;
  }

  renderNode1(node) {
    const div = document.createElement('div');
    div.className = `treeNode_${node.type}`;
    div.dataset.nodeId = node.id;  

    const keySpan = document.createElement('span');
    keySpan.textContent = `${node.label}:`;
    keySpan.title = node.description;

    // const valueSpan = document.createElement('span');
    // valueSpan.textContent = node.description;


    div.appendChild(keySpan);
    // div.appendChild(valueSpan);

    if (node.subNodes.length > 0) {
      div.dataset.expandable = 'true'; 
    }

    const childNodesDiv = document.createElement('div');
    childNodesDiv.className = 'child-nodes';

    for (const subNode of node.subNodes) {
      const subNodeDiv = this.renderNode1(subNode);
      childNodesDiv.appendChild(subNodeDiv);
    }

    div.appendChild(childNodesDiv);
    return div;
  }


  render1(targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (targetElement) {
      for (const rootNode of this.rootNodes) {
        const rootNodeDiv = this.renderNode1(rootNode);
        targetElement.appendChild(rootNodeDiv);
      }
    } else {
      console.error('Target element not found');
    }
  }


  renderNode(node) {
    let str = '';
    str += `<DIV class="treeNode_${node.type||'schemaNode'}" data-node-id="${node.id}" data-expandable="${node.subNodes.length > 0}">
                <SPAN title="${node.description}">${node.label}</SPAN> 
           `;

    if (Array.isArray(node.subNodes)) {
      str += '<div class="child-nodes">';
      for (let i = 0; i < node.subNodes.length; i++) {
        const subNode = node.subNodes[i];
        str += this.renderNode(subNode);
      }
      str += '</div>';
    } else {
      str += `<span class="data-field">${node.description}</span>`;
    }
  
    str += '</DIV>';
    return str;
  }



  render(divId) {
    const e = document.getElementById(divId);
    if (e == null)
     return console.error("Target element '"+divId+"' not found");

    var str = '';
    for (const rootNode of this.rootNodes) {
      str += this.renderNode(rootNode);
    }
    e.innerHTML = str;

    var that = this;
    FloriaDOM.addEvent(e, 'click', (e, event, target) => {
        const nodeDiv = target.closest('[data-node-id]');
        if (!nodeDiv || !nodeDiv.dataset.expandable)
         return;
        event.stopPropagation();
        const childNodesDiv = nodeDiv.querySelector('.child-nodes');
        if (childNodesDiv) {
          if (childNodesDiv.style.display === 'none' || childNodesDiv.style.display === '') {
            childNodesDiv.style.display = 'block';
          } else {
            childNodesDiv.style.display = 'none';
          }
        }

        // Get the nodeId from the clicked element
        const nodeId = nodeDiv.dataset.nodeId;

        // Find the node in the tree with the corresponding nodeId
        let node = null;
        for (let i = 0; i < that.rootNodes.length; i++) {
          node = that.findNodeById(that.rootNodes[i], nodeId);
          if (node != null) {
            node.handleClick(childNodesDiv.style.display=="block");
          }
        }
      }, null, true);
  }
  
  showPathToNode(node) {
    if (node.parentElement) {
      node.parentElement.style.display = 'block';
      this.showPathToNode(node.parentElement);
    }
  }
 
  findNodeById(node, nodeId) {
    if (node.id === nodeId)
      return node;
    
    for (let i = 0; i < node.subNodes.length; i++) {
      const foundNode = this.findNodeById(node.subNodes[i], nodeId);
      if (foundNode)
        return foundNode;
    }
    return null;
  }
  
  search(searchText) {
    const nodes = document.querySelectorAll(`#${divId} div.treeNode_schemaNode`);
    for (const node of nodes) {
      const nodeText = node.textContent.toLowerCase();
      if (nodeText.includes(searchText.toLowerCase())) {
        node.style.display = 'block';
        showPathToNode(node);
      } else {
        node.style.display = 'none';
      }
    }
  }

}

export class FloriaTreeNode {
  constructor(id, label, description, type, data = {}, onClickFunc = null) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.type = type;
    this.data = data;  // new attribute to store the full data
    this.onClickFunc = onClickFunc;  // new attribute to store the full data
    this.subNodes = [];
  }
 addSubNode(node) {
    this.subNodes.push(node);
  }
 handleClick(open)
  {
    if (this.onClickFunc != null)
     this.onClickFunc(this, open);
  }
}
