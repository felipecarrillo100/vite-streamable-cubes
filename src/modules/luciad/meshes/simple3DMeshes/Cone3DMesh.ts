/*
 *
 * Copyright (c) 1999-2025 Luciad All Rights Reserved.
 *
 * Luciad grants you ("Licensee") a non-exclusive, royalty free, license to use,
 * modify and redistribute this software in source and binary code form,
 * provided that i) this copyright notice and license appear on all copies of
 * the software; and ii) Licensee does not utilize the software in a manner
 * which is disparaging to Luciad.
 *
 * This software is provided "AS IS," without a warranty of any kind. ALL
 * EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 * IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR
 * NON-INFRINGEMENT, ARE HEREBY EXCLUDED. LUCIAD AND ITS LICENSORS SHALL NOT BE
 * LIABLE FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING
 * OR DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES. IN NO EVENT WILL LUCIAD OR ITS
 * LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 * INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 * CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 * OR INABILITY TO USE SOFTWARE, EVEN IF LUCIAD HAS BEEN ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGES.
 */
import {createPoint} from "@luciad/ria/shape/ShapeFactory.js";

/**
 * A 3D cone mesh.
 **/
export class Cone3DMesh {

  private readonly _baseRadius: number;
  private readonly _topRadius: number;
  private readonly _height: number;
  private readonly _sliceCount: number;
  private readonly _indices: number[];
  private _zOffset: number;

  /**
   * Creates a 3D cone with given base and top radius, height and number of subdivisions
   * of the side surface.
   * A higher subdivision number will ensure a smoother appearance of the side surface of the cone.
   * @param baseRadius the base radius of the cone
   * @param topRadius the top radius of the cone
   * @param height the cone height
   * @param sliceCount the number of subdivisions of the side surface of the cone around the cone main axis.
   **/
  constructor(baseRadius: number, topRadius: number, height: number, sliceCount: number) {
    this._baseRadius = baseRadius;
    this._topRadius = topRadius;
    this._height = height;
    this._sliceCount = sliceCount;
    this._indices = [];
    this._zOffset = 0;
  }

  get zOffset(): number {
    return this._zOffset;
  }

  set zOffset(value: number) {
    this._zOffset = value;
  }

  createVertices(): number[] {
    const vertices = [];
    let point;
    const dPhi = 2 * Math.PI / (this._sliceCount);
    let x0, y0, x1, y1;
    const baseZ = -0.5 * this._height + this.zOffset;
    const topZ = 0.5 * this._height + this.zOffset;

    let offset = 0;

    // do side surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      x0 = this._baseRadius * nx;
      y0 = this._baseRadius * ny;
      x1 = this._topRadius * nx;
      y1 = this._topRadius * ny;
      // base vertex
      point = createPoint(null, [x0, y0, baseZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i);
      // top vertex
      point = createPoint(null, [x1, y1, topZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i + 1);
    }
    offset = this._indices.length;

    // do base surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      x0 = 0;
      y0 = 0;
      x1 = this._baseRadius * nx;
      y1 = this._baseRadius * ny;
      // inner vertex
      point = createPoint(null, [x0, y0, baseZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i);
      // outer vertex
      point = createPoint(null, [x1, y1, baseZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i + 1);
    }
    offset = this._indices.length;

    // do top surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      x0 = 0;
      y0 = 0;
      x1 = this._topRadius * nx;
      y1 = this._topRadius * ny;
      // inner vertex
      point = createPoint(null, [x0, y0, topZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i);
      // outer vertex
      point = createPoint(null, [x1, y1, topZ]);
      vertices.push(point.x);
      vertices.push(point.y);
      vertices.push(point.z);
      this._indices.push(offset + 2 * i + 1);
    }

    return vertices;
  }

  createIndices(): number[] {
    if (this._indices.length === 0) {
      this.createVertices();
    }

    const triangles = [];
    for (let i = 0; i < 3; i++) {
      const numberOfIndicesPerSide = this._indices.length / 3;
      for (let j = 1; j < numberOfIndicesPerSide - 1; j++) {
        triangles.push(this._indices[j - 1 + i * numberOfIndicesPerSide]);
        triangles.push(this._indices[j + i * numberOfIndicesPerSide]);
        triangles.push(this._indices[j + 1 + i * numberOfIndicesPerSide]);
      }
    }

    return triangles;
  }

  createNormals(): number[] {
    const normals = [];
    let point;
    const dPhi = 2 * Math.PI / (this._sliceCount);

    // do side surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      // base vertex
      point = createPoint(null, [nx, ny, 0]);
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
      // top vertex
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
    }

    // do base surface
    for (let i = 0; i <= this._sliceCount; i++) {
      // inner vertex
      point = createPoint(null, [0, 0, -1]);
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
      // outer vertex
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
    }

    // do top surface
    for (let i = 0; i <= this._sliceCount; i++) {
      // inner vertex
      point = createPoint(null, [0, 0, 1]);
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
      // outer vertex
      normals.push(point.x);
      normals.push(point.y);
      normals.push(point.z);
    }

    return normals;
  }

  createTextureCoordinates(): number[] {
    const texCoords = [];
    const dPhi = 2 * Math.PI / (this._sliceCount);

    // do side surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const tx = phi / (2 * Math.PI);
      // base vertex
      texCoords.push(tx); // u
      texCoords.push(0); // v
      // top vertex
      texCoords.push(tx); // u
      texCoords.push(1); // v
    }

    // do base surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const tx = phi / (2 * Math.PI);
      // inner vertex
      texCoords.push(tx); // u
      texCoords.push(0); // v
      // outer vertex
      texCoords.push(tx); // u
      texCoords.push(1); // v
    }

    // do top surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const tx = phi / (2 * Math.PI);
      // inner vertex
      texCoords.push(tx); // u
      texCoords.push(0); // v
      // outer vertex
      texCoords.push(tx); // u
      texCoords.push(1); // v
    }
    return texCoords;
  }
}