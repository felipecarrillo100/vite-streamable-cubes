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
 * A 3D ellipsoid mesh.
 */
export class Ellipsoid3DMesh {
  private readonly _radiusX: number;
  private readonly _radiusY: number;
  private readonly _radiusZ: number;
  private readonly _verticalSlicesCount: number;
  private readonly _horizontalSlicesCount: number;

  /**
   * Creates a 3D ellipsoid with given radial dimensions in X, Y, and Z axis, and with the given number of
   * vertical and horizontal subdivisions of the surface.
   *
   * A sphere can be obtained by setting the three radial parameters to the same value.
   *
   * @param radiusX the radial dimension along the X axis
   * @param radiusY the radial dimension along the Y axis
   * @param radiusZ the radial dimension along the Z axis
   * @param verticalSlicesCount the number of vertical subdivisions of the surface (similar to lines of longitude)
   * @param horizontalSlicesCount the number of horizontal subdivisions of the surface (similar to lines of latitude)
   *
   **/
  constructor(radiusX: number, radiusY: number, radiusZ: number, verticalSlicesCount: number,
              horizontalSlicesCount: number) {
    this._radiusX = radiusX;
    this._radiusY = radiusY;
    this._radiusZ = radiusZ;
    this._verticalSlicesCount = verticalSlicesCount;
    this._horizontalSlicesCount = horizontalSlicesCount;
  }

  protected get horizontalSlicesEndIndex(): number {
    return this.horizontalSlicesCount;
  }

  protected get horizontalSlicesCount(): number {
    return this._verticalSlicesCount
  }

  createVertices(): number[] {
    const vertices = [];
    const dPhi = 2 * Math.PI / (this._verticalSlicesCount);
    const dTheta = Math.PI / (this._horizontalSlicesCount);
    let x, y, z;
    for (let i = 0; i <= this.horizontalSlicesEndIndex; i++) {
      const tht = -Math.PI / 2 + i * dTheta;
      for (let j = 0; j <= this._verticalSlicesCount; j++) {
        const phi = j * dPhi;
        x = this._radiusX * Math.cos(tht) * Math.cos(phi);
        y = this._radiusY * Math.cos(tht) * Math.sin(phi);
        z = this._radiusZ * Math.sin(tht);
        // base vertex
        vertices.push(x);
        vertices.push(y);
        vertices.push(z);
      }
    }
    return vertices;
  }

  createIndices(): number[] {
    const indices = [];
    for (let i = 0; i < this.horizontalSlicesEndIndex; i++) {
      for (let j = 0; j < this._verticalSlicesCount; j++) {
        const index1 = i * (this._verticalSlicesCount + 1) + j;
        const index2 = i * (this._verticalSlicesCount + 1) + (j + 1);
        const index3 = (i + 1) * (this._verticalSlicesCount + 1) + (j + 1);
        const index4 = (i + 1) * (this._verticalSlicesCount + 1) + j;

        // Triangle 1
        indices.push(index2);
        indices.push(index4);
        indices.push(index3);

        // Triangle 2
        indices.push(index2);
        indices.push(index4);
        indices.push(index1);
      }
    }

    return indices;
  }

  createNormals(): number[] {
    const normals = [];
    const dPhi = 2 * Math.PI / (this._verticalSlicesCount);
    const dTheta = Math.PI / (this._horizontalSlicesCount);
    let nx, ny, nz;
    for (let i = 0; i <= this.horizontalSlicesEndIndex; i++) {
      const tht = -Math.PI / 2 + i * dTheta;
      for (let j = 0; j <= this._verticalSlicesCount; j++) {
        const phi = j * dPhi;
        nx = Math.cos(tht) * Math.cos(phi);
        ny = Math.cos(tht) * Math.sin(phi);
        nz = Math.sin(tht);
        // base vertex
        normals.push(nx);
        normals.push(ny);
        normals.push(nz);
      }
    }
    return normals;
  }

  createTextureCoordinates(): number[] {
    const texCoords = [];
    const dPhi = 2 * Math.PI / (this._verticalSlicesCount);
    const dTheta = Math.PI / (this._horizontalSlicesCount);
    for (let i = 0; i <= this.horizontalSlicesEndIndex; i++) {
      const tht = -Math.PI / 2 + i * dTheta;
      for (let j = 0; j <= this._verticalSlicesCount; j++) {
        const phi = j * dPhi;
        const tx = phi / (2 * Math.PI);
        const ty = 0.5 + tht / Math.PI;
        texCoords.push(tx); // u
        texCoords.push(ty); // v
      }
    }
    return texCoords;
  }
}