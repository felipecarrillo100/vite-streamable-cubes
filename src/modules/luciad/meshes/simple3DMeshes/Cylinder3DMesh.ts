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
/**
 * A 3D cylinder mesh.
 **/
export class Cylinder3DMesh {

  private readonly _radius: number;
  private readonly _height: number;
  private readonly _sliceCount: number;
  private readonly _indices: number[];
  private _zOffset: number;

  /**
   * Creates a 3D cylinder mesh
   *
   * @param radius the radius of the cylinder
   * @param height the height of the cylinder
   * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
   */
  constructor(radius: number, height: number, sliceCount: number) {
    this._radius = radius;
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
    const dphi = 2 * Math.PI / (this._sliceCount);
    const baseZ = -0.5 * this._height + this.zOffset;
    const topZ = 0.5 * this._height + this.zOffset;
    let offset = 0;

    // Side surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      const x0 = this._radius * nx;
      const y0 = this._radius * ny;
      const x1 = x0;
      const y1 = y0;
      // base vertex
      vertices.push(x0);
      vertices.push(y0);
      vertices.push(baseZ);
      this._indices.push(offset + 2 * i);
      // top vertex
      vertices.push(x1);
      vertices.push(y1);
      vertices.push(topZ);
      this._indices.push(offset + 2 * i + 1);
    }
    offset = this._indices.length;

    // Base surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      const x0 = 0;
      const y0 = 0;
      const x1 = this._radius * nx;
      const y1 = this._radius * ny;
      // base vertex
      vertices.push(x0);
      vertices.push(y0);
      vertices.push(baseZ);
      this._indices.push(offset + 2 * i);
      // top vertex
      vertices.push(x1);
      vertices.push(y1);
      vertices.push(baseZ);
      this._indices.push(offset + 2 * i + 1);
    }

    offset = this._indices.length;

    // Top base surface
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      const x0 = 0;
      const y0 = 0;
      const x1 = this._radius * nx;
      const y1 = this._radius * ny;
      // base vertex
      vertices.push(x0);
      vertices.push(y0);
      vertices.push(topZ);
      this._indices.push(offset + 2 * i);
      // top vertex
      vertices.push(x1);
      vertices.push(y1);
      vertices.push(topZ);
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
    const dPhi = 2 * Math.PI / (this._sliceCount);

    // Side
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dPhi;
      const nx = Math.cos(phi);
      const ny = Math.sin(phi);
      // base vertex
      normals.push(nx);
      normals.push(ny);
      normals.push(0);
      // top vertex
      normals.push(nx);
      normals.push(ny);
      normals.push(0);
    }

    // Base
    for (let i = 0; i <= this._sliceCount; i++) {
      // inner vertex
      normals.push(0);
      normals.push(0);
      normals.push(-1);
      // outer vertex
      normals.push(0);
      normals.push(0);
      normals.push(-1);
    }

    // Top base
    for (let i = 0; i <= this._sliceCount; i++) {
      // inner vertex
      normals.push(0);
      normals.push(0);
      normals.push(-1);
      // outer vertex
      normals.push(0);
      normals.push(0);
      normals.push(-1);
    }

    return normals;
  }

  createTextureCoordinates(): number[] {
    const texCoords = [];
    const dphi = 2 * Math.PI / (this._sliceCount);

    // Side
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const tx = phi / (2 * Math.PI);
      // base vertex
      texCoords.push(tx);
      texCoords.push(0);
      // top vertex
      texCoords.push(tx);
      texCoords.push(1);
    }

    // Base
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const tx = phi / (2 * Math.PI);
      // inner vertex
      texCoords.push(tx);
      texCoords.push(0);
      // outer vertex
      texCoords.push(tx);
      texCoords.push(1);
    }

    // Top Base
    for (let i = 0; i <= this._sliceCount; i++) {
      const phi = i * dphi;
      const tx = phi / (2 * Math.PI);
      // inner vertex
      texCoords.push(tx);
      texCoords.push(0);
      // outer vertex
      texCoords.push(tx);
      texCoords.push(1);
    }

    return texCoords;
  }
}