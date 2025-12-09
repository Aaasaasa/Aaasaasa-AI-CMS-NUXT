#!/usr/bin/env bash

#function find-old-tooltips
#    echo "🔍 Tražim preostale reka-ui Tooltip komponente..."
#    rg --color=always --ignore-case '<(TooltipProvider|TooltipTrigger|TooltipContent)' --glob '*.vue' .
# end


echo "🔍 Tražim preostale reka-ui Tooltip komponente..."
rg --color=always --ignore-case '<\(TooltipProvider\|TooltipTrigger\|TooltipContent\)' --glob '*.vue' .
