import { Menu, Portal, Avatar, Button } from "@chakra-ui/react";
import { LuUser, LuSettings, LuLogOut } from "react-icons/lu";

/**
 * Account menu triggered by the user's avatar. Chakra's Menu provides
 * roving focus and menu/menuitem roles; the trigger has an accessible name.
 */
export function UserMenu({ name = "Jane Learner", src, defaultOpen = false }) {
  return (
    <Menu.Root defaultOpen={defaultOpen}>
      <Menu.Trigger asChild>
        <Button variant="plain" p={1} borderRadius="full" aria-label={`Account menu for ${name}`}>
          <Avatar.Root size="sm">
            <Avatar.Fallback name={name} />
            {src && <Avatar.Image src={src} alt="" />}
          </Avatar.Root>
        </Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{name}</Menu.ItemGroupLabel>
              <Menu.Item value="profile"><LuUser /> Profile</Menu.Item>
              <Menu.Item value="settings"><LuSettings /> Settings</Menu.Item>
              <Menu.Separator />
              <Menu.Item value="logout" color="red.fg"><LuLogOut /> Sign out</Menu.Item>
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
