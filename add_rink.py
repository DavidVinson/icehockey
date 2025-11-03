"""
Hockey Rink Visualization Function
Converted from R to Python

This function creates geometric shapes for visualizing a hockey rink,
including lines, circles, arcs, and goal areas.
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, Arc
from matplotlib.collections import LineCollection
import math


def add_rink(direction="vertical", zones=["off", "def"]):
    """
    Create hockey rink visualization components.
    
    Parameters:
    -----------
    direction : str, default "vertical"
        Orientation of the rink: "vertical" or "horizontal"
    zones : list, default ["off", "def"]
        Zones to display: can include "off" (offensive) and "def" (defensive)
    
    Returns:
    --------
    dict : Dictionary containing all rink components with matplotlib patches
    """
    
    # Red line segments
    red_line_segments = {
        "vertical": {
            "x1": [
                # goal line/board intercept
                -36.75, -36.75,
                # crease straight lines
                -4, 4, -4, 4,
                # goalie trapezoid
                11, 11, -11, -11,
                # faceoff tickmarks
                *([23, 21, -21, -23] * 4),
                *([-26, -21, 18, 23] * 4),
                *([
                    -22 - math.sqrt(15**2 - 1.5**2) - 2,
                    -22 + math.sqrt(15**2 - 1.5**2),
                    22 - math.sqrt(15**2 - 1.5**2) - 2,
                    22 + math.sqrt(15**2 - 1.5**2)
                ] * 4),
            ],
            "y1": [
                # goal line/board intercept
                89, -89,
                # crease straight lines
                89, 89, -89, -89,
                # goalie trapezoid
                89, -89, 89, -89,
                # faceoff tickmarks
                *([75, 67, -63, -71] * 4),
                *([71, 67, -67, -71] * 4),
                *([72, 66, -66, -72] * 4),
            ],
            "x2": [
                # goal line/board intercept
                36.75, 36.75,
                # crease straight lines
                -4, 4, -4, 4,
                # goalie trapezoid
                14, 14, -14, -14,
                # faceoff tickmarks
                *([23, 21, -21, -23] * 4),
                *([-23, -18, 21, 26] * 4),
                *([
                    -22 - math.sqrt(15**2 - 1.5**2),
                    -22 + math.sqrt(15**2 - 1.5**2) + 2,
                    22 - math.sqrt(15**2 - 1.5**2),
                    22 + math.sqrt(15**2 - 1.5**2) + 2
                ] * 4),
            ],
            "y2": [
                # goal line/board intercept
                89, -89,
                # crease straight lines
                84.5, 84.5, -84.5, -84.5,
                # goalie trapezoid
                100, -100, 100, -100,
                # faceoff tickmarks
                *([71, 63, -67, -75] * 4),
                *([71, 67, -67, -71] * 4),
                *([72, 66, -66, -72] * 4),
            ]
        },
        "horizontal": {
            "x1": [
                # goal line/board intercept
                89, -89,
                # crease straight lines
                89, 89, -89, -89,
                # goalie trapezoid
                89, -89, 89, -89,
                # faceoff tickmarks
                *([75, 67, -63, -71] * 4),
                *([71, 67, -67, -71] * 4),
                *([72, 66, -66, -72] * 4),
            ],
            "y1": [
                # goal line/board intercept
                -36.75, -36.75,
                # crease straight lines
                -4, 4, -4, 4,
                # goalie trapezoid
                11, 11, -11, -11,
                # faceoff tickmarks
                *([23, 21, -21, -23] * 4),
                *([-26, -21, 18, 23] * 4),
                *([
                    -22 - math.sqrt(15**2 - 1.5**2) - 2,
                    -22 + math.sqrt(15**2 - 1.5**2),
                    22 - math.sqrt(15**2 - 1.5**2) - 2,
                    22 + math.sqrt(15**2 - 1.5**2)
                ] * 4),
            ],
            "x2": [
                # goal line/board intercept
                89, -89,
                # crease straight lines
                84.5, 84.5, -84.5, -84.5,
                # goalie trapezoid
                100, -100, 100, -100,
                # faceoff tickmarks
                *([71, 63, -67, -75] * 4),
                *([71, 67, -67, -71] * 4),
                *([72, 66, -66, -72] * 4),
            ],
            "y2": [
                # goal line/board intercept
                36.75, 36.75,
                # crease straight lines
                -4, 4, -4, 4,
                # goalie trapezoid
                14, 14, -14, -14,
                # faceoff tickmarks
                *([23, 21, -21, -23] * 4),
                *([-23, -18, 21, 26] * 4),
                *([
                    -22 - math.sqrt(15**2 - 1.5**2),
                    -22 + math.sqrt(15**2 - 1.5**2) + 2,
                    22 - math.sqrt(15**2 - 1.5**2),
                    22 + math.sqrt(15**2 - 1.5**2) + 2
                ] * 4),
            ]
        }
    }
    
    # Corners
    corners = {
        "vertical": {
            "x0": [14.5, -14.5, 14.5, -14.5],
            "y0": [72, 72, -72, -72],
            "r": 28,
            "start": [0, 0.5 * math.pi, math.pi, 1.5 * math.pi],
            "end": [0.5 * math.pi, math.pi, 1.5 * math.pi, 2 * math.pi]
        },
        "horizontal": {
            "x0": [72, 72, -72, -72],
            "y0": [14.5, -14.5, -14.5, 14.5],
            "r": 28,
            "start": [0, 0.5 * math.pi, math.pi, 1.5 * math.pi],
            "end": [0.5 * math.pi, math.pi, 1.5 * math.pi, 2 * math.pi]
        }
    }
    
    # Creases
    creases = {
        "vertical": {
            "x0": [0, 0, 0, 0, 42.5],
            "y0": [0, 0, 89, -89, 0],
            "r": [15, 15, math.sqrt(16 + 4.5**2), math.sqrt(16 + 4.5**2), 10],
            "start": [0, math.pi, math.pi - math.atan(4/4.5), 2*math.pi - math.atan(4/4.5), math.pi],
            "end": [math.pi, 2*math.pi, math.pi + math.atan(4/4.5), 2*math.pi + math.atan(4/4.5), 2*math.pi]
        },
        "horizontal": {
            "x0": [0, 0, 89, -89, 0],
            "y0": [0, 0, 0, 0, -42.5],
            "r": [15, 15, math.sqrt(16 + 4.5**2), math.sqrt(16 + 4.5**2), 10],
            "start": [0.5*math.pi, 1.5*math.pi, 1.5*math.pi - math.atan(4/4.5), 2.5*math.pi - math.atan(4/4.5), 1.5*math.pi],
            "end": [1.5*math.pi, 2.5*math.pi, 1.5*math.pi + math.atan(4/4.5), 2.5*math.pi + math.atan(4/4.5), 2.5*math.pi]
        }
    }
    
    # Dots (faceoff dots)
    dots = {
        "vertical": {
            "x0": [22, -22, 22, -22, 22, -22, 22, -22],
            "y0": [22, 22, -22, -22, 69, 69, -69, -69],
            "r": 1
        },
        "horizontal": {
            "x0": [22, -22, 22, -22, 69, 69, -69, -69],
            "y0": [22, -22, 69, -69, 22, -22, 22, -22],
            "r": 1
        }
    }
    
    # Circles (faceoff circles)
    circles = {
        "vertical": {
            "x0": [22, 22, -22, -22],
            "y0": [69, -69, 69, -69],
            "r": 15
        },
        "horizontal": {
            "x0": [69, -69, 69, -69],
            "y0": [22, 22, -22, -22],
            "r": 15
        }
    }
    
    # Sides
    sides = {
        "vertical": {
            "x1": [42.5, 42.5, -42.5, -42.5, 14.5, 14.5],
            "y1": [72, 0.5, 72, 0.5, 100, -100],
            "x2": [42.5, 42.5, -42.5, -42.5, -14.5, -14.5],
            "y2": [-0.5, -72, -0.5, -72, 100, -100]
        },
        "horizontal": {
            "x1": [72, 0.5, 72, 0.5, 100, -100],
            "y1": [42.5, 42.5, -42.5, -42.5, 14.5, 14.5],
            "x2": [-0.5, -72, -0.5, -72, 100, -100],
            "y2": [42.5, 42.5, -42.5, -42.5, -14.5, -14.5]
        }
    }
    
    # Nets
    nets = {
        "vertical": {
            "xmin": [-3, -3],
            "xmax": [3, 3],
            "ymin": [89, -89],
            "ymax": [92.33, -92.33]
        },
        "horizontal": {
            "xmin": [89, -92.33],
            "xmax": [92.33, -89],
            "ymin": [-3, -3],
            "ymax": [3, 3]
        }
    }
    
    # Center line
    center_line = {
        "vertical": {
            "xmin": -42.5,
            "xmax": 42.5,
            "ymin": -0.5,
            "ymax": 0.5
        },
        "horizontal": {
            "xmin": -0.5,
            "xmax": 0.5,
            "ymin": -42.5,
            "ymax": 42.5
        }
    }
    
    # Blue lines
    blue_lines = {
        "vertical": {
            "xmin": [-42.5, -42.5],
            "xmax": [42.5, 42.5],
            "ymin": [-26, 25],
            "ymax": [-25, 26]
        },
        "horizontal": {
            "xmin": [-26, 25],
            "xmax": [-25, 26],
            "ymin": [-42.5, -42.5],
            "ymax": [42.5, 42.5]
        }
    }
    
    # Center dot
    center_dot = {
        "x0": 0,
        "y0": 0,
        "r": 0.5
    }
    
    # Calculate axis limits based on direction and zones
    if direction == "vertical":
        xlim = (-42.5, 42.5)
        if "def" in zones:
            ylim_min = -100
        else:
            ylim_min = -0.5
        if "off" in zones:
            ylim_max = 100
        else:
            ylim_max = 0.5
        ylim = (ylim_min, ylim_max)
    else:  # horizontal
        ylim = (-42.5, 42.5)
        if "def" in zones:
            xlim_min = -100
        else:
            xlim_min = -0.5
        if "off" in zones:
            xlim_max = 100
        else:
            xlim_max = 0.5
        xlim = (xlim_min, xlim_max)
    
    # Return all components organized by type
    return {
        "red_line_segments": red_line_segments[direction],
        "corners": corners[direction],
        "creases": creases[direction],
        "dots": dots[direction],
        "circles": circles[direction],
        "sides": sides[direction],
        "nets": nets[direction],
        "center_line": center_line[direction],
        "blue_lines": blue_lines[direction],
        "center_dot": center_dot,
        "direction": direction,
        "zones": zones,
        "xlim": xlim,
        "ylim": ylim
    }


def plot_rink(direction="vertical", zones=["off", "def"], ax=None, figsize=(10, 10)):
    """
    Plot the hockey rink using matplotlib.
    
    Parameters:
    -----------
    direction : str, default "vertical"
        Orientation of the rink: "vertical" or "horizontal"
    zones : list, default ["off", "def"]
        Zones to display: can include "off" (offensive) and "def" (defensive)
    ax : matplotlib.axes.Axes, optional
        Axes to plot on. If None, creates a new figure and axes.
    figsize : tuple, default (10, 10)
        Figure size if creating new axes
    
    Returns:
    --------
    matplotlib.axes.Axes : The axes with the rink plotted
    """
    
    if ax is None:
        fig, ax = plt.subplots(figsize=figsize)
    
    rink_data = add_rink(direction=direction, zones=zones)
    
    # Draw nets
    nets = rink_data["nets"]
    for i in range(len(nets["xmin"])):
        rect = Rectangle(
            (nets["xmin"][i], nets["ymin"][i]),
            nets["xmax"][i] - nets["xmin"][i],
            nets["ymax"][i] - nets["ymin"][i],
            linewidth=2,
            edgecolor='black',
            facecolor='gray',
            alpha=0.3
        )
        ax.add_patch(rect)
    
    # Draw red line segments
    red_segs = rink_data["red_line_segments"]
    for i in range(len(red_segs["x1"])):
        ax.plot(
            [red_segs["x1"][i], red_segs["x2"][i]],
            [red_segs["y1"][i], red_segs["y2"][i]],
            'r-', linewidth=1.5
        )
    
    # Draw center red line
    cl = rink_data["center_line"]
    rect = Rectangle(
        (cl["xmin"], cl["ymin"]),
        cl["xmax"] - cl["xmin"],
        cl["ymax"] - cl["ymin"],
        linewidth=0,
        facecolor='red',
        alpha=0.7
    )
    ax.add_patch(rect)
    
    # Draw blue lines
    bl = rink_data["blue_lines"]
    for i in range(len(bl["xmin"])):
        rect = Rectangle(
            (bl["xmin"][i], bl["ymin"][i]),
            bl["xmax"][i] - bl["xmin"][i],
            bl["ymax"][i] - bl["ymin"][i],
            linewidth=0,
            facecolor='blue',
            alpha=0.7
        )
        ax.add_patch(rect)
    
    # Draw creases (arcs)
    creases = rink_data["creases"]
    for i in range(len(creases["x0"])):
        arc = Arc(
            (creases["x0"][i], creases["y0"][i]),
            2 * creases["r"][i],
            2 * creases["r"][i],
            theta1=math.degrees(creases["start"][i]),
            theta2=math.degrees(creases["end"][i]),
            linewidth=2,
            edgecolor='red'
        )
        ax.add_patch(arc)
    
    # Draw center dot
    cd = rink_data["center_dot"]
    circle = Circle(
        (cd["x0"], cd["y0"]),
        cd["r"],
        linewidth=0,
        facecolor='blue',
        edgecolor='blue'
    )
    ax.add_patch(circle)
    
    # Draw faceoff dots
    dots = rink_data["dots"]
    for i in range(len(dots["x0"])):
        circle = Circle(
            (dots["x0"][i], dots["y0"][i]),
            dots["r"],
            linewidth=0,
            facecolor='red',
            edgecolor='red'
        )
        ax.add_patch(circle)
    
    # Draw faceoff circles
    circles = rink_data["circles"]
    for i in range(len(circles["x0"])):
        circle = Circle(
            (circles["x0"][i], circles["y0"][i]),
            circles["r"],
            linewidth=2,
            facecolor='none',
            edgecolor='red'
        )
        ax.add_patch(circle)
    
    # Draw sides
    sides = rink_data["sides"]
    for i in range(len(sides["x1"])):
        ax.plot(
            [sides["x1"][i], sides["x2"][i]],
            [sides["y1"][i], sides["y2"][i]],
            'k-', linewidth=2
        )
    
    # Draw corners (arcs)
    corners = rink_data["corners"]
    for i in range(len(corners["x0"])):
        arc = Arc(
            (corners["x0"][i], corners["y0"][i]),
            2 * corners["r"],
            2 * corners["r"],
            theta1=math.degrees(corners["start"][i]),
            theta2=math.degrees(corners["end"][i]),
            linewidth=2,
            edgecolor='black'
        )
        ax.add_patch(arc)
    
    # Set axis limits and aspect ratio
    ax.set_xlim(rink_data["xlim"])
    ax.set_ylim(rink_data["ylim"])
    ax.set_aspect('equal')
    ax.axis('off')
    
    return ax


# Example usage
if __name__ == "__main__":
    # Create a vertical rink with all zones
    fig, ax = plt.subplots(figsize=(12, 20))
    plot_rink(direction="vertical", zones=["off", "def"], ax=ax)
    plt.title("Hockey Rink - Vertical Orientation")
    plt.tight_layout()
    plt.savefig("rink_vertical.png", dpi=150, bbox_inches='tight')
    plt.show()
    
    # Create a horizontal rink
    fig, ax = plt.subplots(figsize=(20, 12))
    plot_rink(direction="horizontal", zones=["off", "def"], ax=ax)
    plt.title("Hockey Rink - Horizontal Orientation")
    plt.tight_layout()
    plt.savefig("rink_horizontal.png", dpi=150, bbox_inches='tight')
    plt.show()

