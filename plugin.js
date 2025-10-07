eruda.add(function (eruda) {
    class AlignmentTool extends eruda.Tool {
        constructor() {
            super();
            this.name = 'Alignment';
            this.style = eruda.util.evalCss(`
                .eruda-alignment {
                    padding: 10px;
                    font-family: monospace;
                }
                .eruda-alignment .info {
                    margin-bottom: 10px;
                }
                .eruda-alignment .picker-btn {
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    margin-bottom: 10px;
                }
                .eruda-alignment .picker-btn:hover {
                    background: #45a049;
                }
                .eruda-alignment canvas {
                    border: 1px solid #ccc;
                    margin-top: 10px;
                    display: block;
                    width: 400px;
                    height: 300px;
                }
                .eruda-alignment .label {
                    font-size: 12px;
                    color: #2196F3;
                    position: absolute;
                    background: rgba(255, 255, 255, 0.8);
                    padding: 2px 4px;
                    border-radius: 3px;
                    pointer-events: none;
                }
                .eruda-alignment .element-info {
                    margin-top: 10px;
                    font-size: 12px;
                    color: #555;
                }
            `);
            this.selectedElement = null;
            this.labels = [];
        }

        init($el) {
            super.init($el);
            this._$el = $el;
            this._$el.addClass('eruda-alignment');
            this._$el.html(`
                <div class="info">Click the button below and then click any element on the page to see its alignment.</div>
                <button class="picker-btn">Select Element</button>
                <div class="element-info"></div>
                <div style="position: relative;">
                    <canvas width="400" height="300"></canvas>
                </div>
            `);
            this._$el.find('.picker-btn').on('click', () => this._startElementPicker());
            this.canvas = this._$el.find('canvas')[0];
            this.ctx = this.canvas.getContext('2d');
            this.container = this._$el.find('div[style="position: relative;"]')[0];
        }

        show() {
            this._$el.show();
            if (this.selectedElement) {
                this._drawAlignment(this.selectedElement);
            }
        }

        hide() {
            this._$el.hide();
        }

        destroy() {
            super.destroy();
            eruda.util.evalCss.remove(this.style);
            document.removeEventListener('click', this._handleElementPick);
        }

        _startElementPicker() {
            this._$el.find('.info').text('Click any element on the page...');
            setTimeout(() => {
                document.addEventListener('click', this._handleElementPick.bind(this), { once: true, capture: true });
            }, 0);
        }

        _handleElementPick(e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            if (e.target.classList.contains('picker-btn')) {
                return;
            }

            this.selectedElement = e.target;
            this._drawAlignment(this.selectedElement);
            this._$el.find('.info').text('Element selected. Click the button again to pick another.');
        }

        _clearLabels() {
            this.labels.forEach(label => label.remove());
            this.labels = [];
        }

        _drawAlignment(el) {
            if (!el || !el.parentElement) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillText('No element selected or parent not found.', 10, 20);
                this._clearLabels();
                this._$el.find('.element-info').text('');
                return;
            }

            const parent = el.parentElement;
            const elRect = el.getBoundingClientRect();
            const parentRect = parent.getBoundingClientRect();

            // Clear canvas and labels
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this._clearLabels();

            // Display element name and children
            const elementName = el.tagName.toLowerCase();
            const childrenCount = el.children ? el.children.length : 0;
            this._$el.find('.element-info').html(
                `<strong>Element:</strong> ${elementName} <br> <strong>Children:</strong> ${childrenCount}`
            );

            // Calculate scale to fit both parent and element in the canvas with padding
            const padding = 40;
            const minElementSize = 20; // Minimum size for small elements
            const elementWidth = Math.max(elRect.width, minElementSize);
            const elementHeight = Math.max(elRect.height, minElementSize);

            const maxWidth = Math.max(parentRect.width, elementWidth) + padding * 2;
            const maxHeight = Math.max(parentRect.height, elementHeight) + padding * 2;
            const scaleX = (this.canvas.width - padding * 2) / maxWidth;
            const scaleY = (this.canvas.height - padding * 2) / maxHeight;
            const scale = Math.min(scaleX, scaleY, 1);

            // Calculate offset to center the visualization
            const offsetX = (this.canvas.width - parentRect.width * scale) / 2;
            const offsetY = (this.canvas.height - parentRect.height * scale) / 2;

            // Draw parent rectangle (green)
            this.ctx.strokeStyle = '#4CAF50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                offsetX,
                offsetY,
                parentRect.width * scale,
                parentRect.height * scale
            );

            // Draw element rectangle (red)
            this.ctx.strokeStyle = '#FF5722';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                offsetX + (elRect.left - parentRect.left) * scale,
                offsetY + (elRect.top - parentRect.top) * scale,
                elementWidth * scale,
                elementHeight * scale
            );

            // Draw connecting lines and labels (blue)
            this.ctx.strokeStyle = '#2196F3';
            this.ctx.lineWidth = 1;

            // Left distance
            const leftDist = elRect.left - parentRect.left;
            this._drawLineAndLabel(
                offsetX + (elRect.left - parentRect.left) * scale,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale,
                offsetX,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale,
                `${leftDist.toFixed(1)}px`,
                offsetX + (elRect.left - parentRect.left) * scale / 2,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale - 10
            );

            // Top distance
            const topDist = elRect.top - parentRect.top;
            this._drawLineAndLabel(
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale,
                offsetY + (elRect.top - parentRect.top) * scale,
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale,
                offsetY,
                `${topDist.toFixed(1)}px`,
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale - 20,
                offsetY + (elRect.top - parentRect.top) * scale / 2
            );

            // Right distance
            const rightDist = parentRect.right - elRect.right;
            this._drawLineAndLabel(
                offsetX + (elRect.left - parentRect.left) * scale + elementWidth * scale,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale,
                offsetX + parentRect.width * scale,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale,
                `${rightDist.toFixed(1)}px`,
                offsetX + (elRect.left - parentRect.left) * scale + elementWidth * scale + 5,
                offsetY + elementHeight * scale / 2 + (elRect.top - parentRect.top) * scale - 10
            );

            // Bottom distance
            const bottomDist = parentRect.bottom - elRect.bottom;
            this._drawLineAndLabel(
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale,
                offsetY + (elRect.top - parentRect.top) * scale + elementHeight * scale,
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale,
                offsetY + parentRect.height * scale,
                `${bottomDist.toFixed(1)}px`,
                offsetX + elementWidth * scale / 2 + (elRect.left - parentRect.left) * scale - 20,
                offsetY + (elRect.top - parentRect.top) * scale + elementHeight * scale + 15
            );
        }

        _drawLineAndLabel(x1, y1, x2, y2, text, labelX, labelY) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();

            // Add label
            const label = document.createElement('div');
            label.className = 'label';
            label.textContent = text;
            label.style.left = `${labelX}px`;
            label.style.top = `${labelY}px`;
            this.container.appendChild(label);
            this.labels.push(label);
        }
    }

    return new AlignmentTool();
});
