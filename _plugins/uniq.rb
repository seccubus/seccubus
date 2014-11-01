module Jekyll
    module Navigation
        def custom_group_by(input, property)
            if groupable?(input)
                input.group_by do |item|
                    item_property(item, property).to_s
                end.map do |f,p|
                    p.first
                end
            else
                input
            end
        end
    end
end

Liquid::Template.register_filter(Jekyll::Navigation)
