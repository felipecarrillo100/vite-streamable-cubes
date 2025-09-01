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
import {Cone3DMesh} from "./Cone3DMesh.js";
import {Cylinder3DMesh} from "./Cylinder3DMesh.js";

/**
 * A 3D arrow mesh.
 */
export class Arrow3DMesh {

  private readonly _cylinder3DMesh: Cylinder3DMesh;
  private readonly _cone3DMesh: Cone3DMesh;

  /**
   * Creates a 3D arrow mesh with the given dimensional parameters.
   * A 3D arrow is composed of two parts:
   *   - A stick (cylindrical shape)
   *   - A tip (conic shape)
   *
   * @param stickRadius the radius of the arrow stick
   * @param stickHeight the height of the arrow stick
   * @param tipBaseRadius the radius of the arrow tip's bottom base
   * @param tipTopRadius the radius of the arrow tip's top base
   * @param tipHeight the height of the arrow tip
   * @param sliceCount the number of slices (subdivisions) of the side surface of the stick and the tip
   */
  constructor(
      stickRadius: number,
      stickHeight: number,
      tipBaseRadius: number,
      tipTopRadius: number,
      tipHeight: number,
      sliceCount: number
  ) {
    this._cylinder3DMesh = new Cylinder3DMesh(stickRadius, stickHeight, sliceCount);
    this._cone3DMesh = new Cone3DMesh(tipBaseRadius, tipTopRadius, tipHeight, sliceCount);

    // Adjust the z value of the stick and tip so that they are properly connected
    this._cylinder3DMesh.zOffset = -(stickHeight / 2);
    this._cone3DMesh.zOffset = tipHeight / 2;
  }

  createVertices(): number[] {
    return this._cylinder3DMesh.createVertices().concat(this._cone3DMesh.createVertices());
  }

  createIndices(): number[] {
    const arrowIndices = this._cylinder3DMesh.createIndices();
    const firstIndexForArrowTip = Math.max.apply(null, arrowIndices) + 1;

    const tipIndices = this._cone3DMesh.createIndices();
    for (let i = 0; i < tipIndices.length; i++) {
      arrowIndices.push(tipIndices[i] + firstIndexForArrowTip);
    }
    return arrowIndices;
  }

  createNormals(): number[] {
    return this._cylinder3DMesh.createNormals().concat(this._cone3DMesh.createNormals());
  }

  createTextureCoordinates(): number[] {
    return this._cylinder3DMesh.createTextureCoordinates().concat(this._cone3DMesh.createTextureCoordinates());
  }
}