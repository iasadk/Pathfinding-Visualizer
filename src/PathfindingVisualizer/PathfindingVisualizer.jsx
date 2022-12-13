import React, { useEffect, useState } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { dijkstra, getShortestPathNodesInOrder } from "../algorithm/dijkstra";

let START_NODE_ROW = 11;
let START_NODE_COL = 15;
let FINISH_NODE_ROW = 11;
let FINISH_NODE_COL = 55;

export default function PathfindingVisualizer() {
  const [node, setNode] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [startCreateWalls, setStartCreateWalls] = useState(false);
  const [moveStart, setMoveStart] = useState(false);
  const [moveFinish, setMoveFinish] = useState(false);

  useEffect(() => {
    const createInitialGrid = () => {
      const node = [];
      for (let row = 0; row < 23; row++) {
        const currentRow = [];
        for (let col = 0; col < 70; col++) {
          currentRow.push(createNode(row, col));
        }
        node.push(currentRow);
      }
      setNode(node);
    };
    createInitialGrid();
  }, []);

  const createNode = (row, col) => {
    return {
      row,
      col,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
      distance: Infinity,
      isVisited: false,
      isWall: false,
      previousNode: null,
    };
  };

  const createWalls = (row,col) =>{
    const newNode = node.slice();
    newNode[row][col].isWall = true;
    setNode(newNode);
  }

  const moveStartNode = (row,col) => {
    const newNode = node.slice();
    const grid = newNode[row][col];
    newNode[row][col].isStart = !grid.isStart;
    START_NODE_ROW = row;
    START_NODE_COL = col;
    setNode(newNode);
  }

  const moveFinishNode = (row,col) => {
    const newNode = node.slice();
    const grid = newNode[row][col];
    newNode[row][col].isFinish = !grid.isFinish;
    FINISH_NODE_ROW = row;
    FINISH_NODE_COL = col;
    setNode(newNode);
  }

  const handleMouseDown = (isStart,row,col,isFinish) => {
    if(isStart){
      moveStartNode(row,col);
      setMoveStart(true);
    }
    if(isFinish){
      moveFinishNode(row,col);
      setMoveFinish(true);
    }
    if(startCreateWalls){
      createWalls(row,col);
      setMouseIsPressed(true);
    }
  }

  const handleMouseEnter = (row,col) => {
    if(!startCreateWalls){
      return;
    }
    if(!mouseIsPressed) return;
    createWalls(row,col);
  }

  const handleMouseUp = (row,col) => {
    if(startCreateWalls){
      setMouseIsPressed(false);
    }
    if(moveStart){
      moveStartNode(row,col);
      setMoveStart(false);
    }
    if(moveFinish){
      moveFinishNode(row,col);
      setMoveFinish(false);
    }
  }

  const animateDijkstra = (visitedNodesInOrder,nodesInShortestPath) => {
    for (let i = 1; i < visitedNodesInOrder.length; i++) {
      if(i === visitedNodesInOrder.length-2){
        setTimeout(()=>{
          animateShortestPath(nodesInShortestPath);
        }, 10 * i );
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  };

  const animateShortestPath = (nodesInShortestPath) => {
    for(let i = 0; i < nodesInShortestPath.length-1; i++){
      setTimeout(() => {
        const node = nodesInShortestPath[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortestpath";
      }, 50 * i);
    }
  };

  const visualizeDijkstra = () => {
    const startNode = node[START_NODE_ROW][START_NODE_COL];
    const finishNode = node[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(node, startNode, finishNode);
    const nodesInShortestPath = getShortestPathNodesInOrder(finishNode);
    animateDijkstra(visitedNodesInOrder,nodesInShortestPath);
    if (finishNode.previousNode === null)
      alert("Could not find the shortest path.");
  };

  return (
    <>
      <div className="pathfinding-visualiser">
        <button onClick={visualizeDijkstra}>
          Visualise Dijkstra's algorithm
        </button>
        <button onClick={()=>{setStartCreateWalls(true)}}>
          Create Walls
        </button>
      </div>
      <table className="grid">
        <tbody>
          {node.map((row, rowIdx) => {
            return (
              <tr className="rows" key={rowIdx}>
                {row.map((currentNode, currentNodeIdx) => {
                  const { row, col, isStart, isFinish, isVisited, isWall} =
                    currentNode;
                  return (
                    <Node
                      key={currentNodeIdx}
                      row={row}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isVisited={isVisited}
                      isWall = {isWall}
                      onMouseDown={(isStart,row,col,isFinish)=>{handleMouseDown(isStart,row,col,isFinish)}}
                      onMouseEnter={(row,col)=>{handleMouseEnter(row,col)}}
                      onMouseUp={(row,col)=>{handleMouseUp(row,col)}}
                    ></Node>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
