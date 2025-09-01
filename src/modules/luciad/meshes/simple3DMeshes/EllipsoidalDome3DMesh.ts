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
import {Ellipsoid3DMesh} from "./Ellipsoid3DMesh.js";

/**
 * A 3D ellipsoidal dome mesh.
 */
export class EllipsoidalDome3DMesh extends Ellipsoid3DMesh {

  /**
   * Creates a 3D ellipsoidal dome with given radial dimensions in X, Y, and Z axis, and with the given number of
   * vertical and horizontal subdivisions of the surface.
   *
   * A dome can be obtained by setting the three radial parameters to the same value.
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
    super(
        radiusX,
        radiusY,
        radiusZ,
        verticalSlicesCount % 2 === 0 ? verticalSlicesCount : verticalSlicesCount + 1,
        horizontalSlicesCount % 2 === 0 ? horizontalSlicesCount : horizontalSlicesCount + 1
    );
  }

  protected get horizontalSlicesEndIndex(): number {
    return this.horizontalSlicesCount / 2;
  }
}